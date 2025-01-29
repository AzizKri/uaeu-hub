import { Context } from 'hono';
import { getSignedCookie } from 'hono/cookie';
import { z } from 'zod';
import { isUsernameValid, userSchema } from '../util/validationSchemas';
import { sendAuthCookie, sendUserIdCookie } from '../util/util';
import { generateSalt, hashPassword, hashSessionKey, verifyPassword } from '../util/crypto';
import { OAuth2Client } from 'google-auth-library';
import * as sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';

/* User Authentication */

// Simple check if this user has a session key or not
export async function isUser(c: Context) {
    const sessionKey = await getSignedCookie(c, c.env.EN_SECRET, 'sessionKey') as string;

    // No session key, not a user
    if (!sessionKey) return c.json({ user: false, status: 200 }, 200);

    // Is a user
    return c.json({ user: true, status: 200 }, 200);
}

// Check if this user is anonymous
export async function isAnon(c: Context) {
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if anon
    if (isAnonymous) return c.json({ message: 'Anonymous', anon: true, status: 200 }, 200);

    // Not anon
    return c.json({ message: 'Not Anonymous', anon: false, status: 200 }, 200);
}

export async function signup(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Some idiot tries to sign up when they're already logged in
    if (userId && !isAnonymous) return c.json({ message: 'Already Logged In', status: 401 }, 401);

    // Get input data
    const { displayname, email, username, password, includeAnon } = await c.req.json();

    // Parse the input data
    try {
        userSchema.parse({ displayname, email, username, password });
    } catch (e) {
        if (e instanceof z.ZodError) {
            const errors = e.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        } else {
            return c.json({ message: 'Internal Server Error', status: 500 }, 500);
        }
    }

    // Check if username is reserved
    if (!isUsernameValid(username)) return c.json({ message: 'Username is reserved', status: 400 }, 400);

    // Check if username / email already used
    const existingUser = await env.DB.prepare(`
        SELECT username
        FROM user
        WHERE username = ?
           OR email = ?`).bind(username, email).all<UserRow>();

    if (existingUser.results.length != 0) return c.json({ message: 'User already exists', status: 409 }, 409);

    // Generate salt, encoded salt (for storing in db) & hash password with plain salt
    const { salt, encoded } = generateSalt();
    const hash = await hashPassword(password, salt);

    try {
        // Do we want to include anonymous data?
        if (includeAnon) {
            // Did we get a userId from the middleware?
            if (userId) {
                // Yes, this is an anon user, continue by updating
                const user = await env.DB.prepare(`
                    UPDATE user
                    SET username     = ?,
                        displayname  = ?,
                        email        = ?,
                        password     = ?,
                        salt         = ?,
                        is_anonymous = false
                    WHERE id = ?
                    RETURNING id
                `).bind(username, (displayname ? displayname : username), email, hash, encoded, userId).first<UserRow>();

                // I have trust issues
                if (!user) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

                const existingSessionKey = await getSignedCookie(c, env.EN_SECRET, 'sessionKey') as string;

                // Send session key & token
                await sendAuthCookie(c, existingSessionKey);
                await sendUserIdCookie(c, userId.toString(), false);

                return c.json({ message: 'User updated successfully', status: 200 }, 200);
            } else {
                // No session key, no activity. Include whose activity????
                return c.json({ message: 'No activity found', status: 400 }, 400);
            }
        } else {
            // New user, no activity
            const user = await env.DB.prepare(`
                INSERT INTO user (username, displayname, email, password, salt)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id, username, displayname, created_at, bio, pfp, is_anonymous
            `).bind(username, (displayname ? displayname : username), email, hash, encoded).first<UserView>();

            if (!user) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

            // Generate Session Key & Salt
            const PlainSessionKey = randomBytes(32).toString('hex');
            const sessionKey = await hashSessionKey(PlainSessionKey);

            // Insert session key into session table, add as member of the general community & send email verification
            // Set the user data in the context
            c.set('userId', user.id);
            c.set('username', username);
            c.set('email', email);

            // Finalize the process in the background
            c.executionCtx.waitUntil(Promise.all([
                    // Insert into session table
                    await env.DB.prepare(`
                        INSERT INTO session (id, user_id, is_anonymous, ip)
                        VALUES (?, ?, false, ?)
                    `).bind(sessionKey, user.id, c.req.header('cf-connecting-ip') || '').run(),

                    // Add user to general community
                    await env.DB.prepare(`
                        INSERT INTO user_community (user_id, community_id, role_id)
                        VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
                    `).bind(user.id).run(),

                    // Send email verification
                    sendEmailVerification(c, true)
                ]).then(() => console.log('User created successfully'))
                    .catch((e) => console.log('User creation failed', e))
            );

            // Send session key & token
            await sendAuthCookie(c, PlainSessionKey);
            await sendUserIdCookie(c, user.id.toString(), false);

            return c.json(user, { status: 201 });
        }
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function authenticateWithGoogle(c: Context) {
    const env: Env = c.env;
    // const userId = c.get('userId') as number;

    // Some idiot tries to log in when they're already logged in?
    // if (userId) return c.json({ message: 'Already Logged In', status: 401 }, 401);

    const { code } = await c.req.json();
    if (!code) return c.json({ message: 'Missing required fields', status: 400 }, 400);

    const oAuth2Client = new OAuth2Client(
        env.CLIENT_ID,
        env.CLIENT_SECRET,
        'postmessage'
    );

    // Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);

    // Fetch data from Google
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`);

    // Validate
    const { email, email_verified, name, given_name, picture, sub, exp } = await response.json() as GoogleTokenResponse;
    if (!email || !email_verified || !name || !given_name || !sub || !exp) return c.json({
        message: 'Invalid token',
        status: 401
    }, 401);
    if (!isNaN(Number(exp)) && Number(exp) < Date.now() / 1000) return c.json({
        message: 'Token expired',
        status: 401
    }, 401);

    try {
        // Check if user exists
        const user = await env.DB.prepare(`
            SELECT id,
                   username,
                   email,
                   bio,
                   displayname,
                   pfp,
                   google_id,
                   is_anonymous
            FROM user
            WHERE google_id = ?
        `).bind(sub).first<UserRow>();

        // If user exists, generate session key & token
        if (user) {
            const PlainSessionKey = randomBytes(32).toString('hex');
            const sessionKey = await hashSessionKey(PlainSessionKey);

            c.executionCtx.waitUntil(
                env.DB.prepare(`
                    INSERT INTO session (id, user_id, is_anonymous, ip)
                    VALUES (?, ?, false, ?)
                `).bind(sessionKey, user.id, c.req.header('cf-connecting-ip') || '').run()
            );

            await sendAuthCookie(c, PlainSessionKey);
            await sendUserIdCookie(c, user.id.toString(), false);

            return c.json(user, { status: 200 });
        } else {
            // Check if the email is already used
            const existingUser = await env.DB.prepare(`
                SELECT username
                FROM user
                WHERE email = ?
            `).bind(email).all<UserRow>();

            // May reconsider later
            if (existingUser.results.length > 0) return c.json({ message: 'Email already in use', status: 409 }, 409);

            // Generate username
            const username = name.replace(/[^a-z0-9.\-_]/i, '') + (Math.floor(Math.random() * 1000).toString());

            // Sign up
            const newUser = await env.DB.prepare(`
                INSERT INTO user (username, displayname, email, email_verified, google_id, pfp, auth_provider)
                VALUES (?, ?, ?, true, ?, ?, 'google')
                RETURNING id, username, displayname, bio, email, pfp, is_anonymous
            `).bind(username, name, email, sub, picture).first<UserView>();

            // I have trust issues
            if (!newUser) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

            // Generate session key & token
            const PlainSessionKey = randomBytes(32).toString('hex');
            const sessionKey = await hashSessionKey(PlainSessionKey);

            // Send cookies
            await sendAuthCookie(c, PlainSessionKey);
            await sendUserIdCookie(c, newUser.id.toString(), false);

            c.executionCtx.waitUntil(Promise.all([
                    // Insert into session table
                    env.DB.prepare(`
                        INSERT INTO session (id, user_id, is_anonymous, ip)
                        VALUES (?, ?, false, ?)
                    `).bind(sessionKey, newUser.id, c.req.header('cf-connecting-ip') || '').run(),

                    // Add user to general community
                    env.DB.prepare(`
                        INSERT INTO user_community (user_id, community_id, role_id)
                        VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
                    `).bind(newUser.id).run()
                ]).then(() => console.log('User created successfully'))
                    .catch((e) => console.log('User creation failed', e))
            );

            return c.json(newUser, { status: 201 });
        }
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function anonSignup(c: Context, returnInternal: boolean = false) {
    const env: Env = c.env;

    // Check if user is already logged in
    const existingUserId = c.get('userId') as number;
    if (existingUserId) return c.json({ message: 'Already Logged In', status: 401 }, 401);


    let username: string = '';
    let existingUser;

    do {
        // Generate random username, check if already exists
        username = `anon_${Math.floor(Math.random() * (Date.now() / 1000))}`; // TODO convert to random words

        existingUser = await env.DB.prepare(`
            SELECT username
            FROM user
            WHERE username = ?`).bind(username).all<UserRow>();
    } while (existingUser.results.length > 0);

    try {
        // Insert into DB
        const user = await env.DB.prepare(`
            INSERT INTO user (username, displayname, is_anonymous)
            VALUES (?, ?, ?)
            RETURNING id
        `).bind(username, 'Anonymous', true).first<UserRow>();

        // Error?
        if (!user) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

        // All good, generate session key & hash it
        const PlainSessionKey = randomBytes(32).toString('hex');
        const sessionKey = await hashSessionKey(PlainSessionKey);

        // const { encoded } = generateSalt();
        // const sessionKey = await hashSessionKey(PlainSessionKey, encoded);

        // Insert into session table without waiting
        c.executionCtx.waitUntil(
            env.DB.prepare(`
                INSERT INTO session (id, user_id, is_anonymous, ip)
                VALUES (?, ?, true, ?)
            `).bind(sessionKey, user.id, c.req.header('cf-connecting-ip') || '').run()
        );

        // Send the session key & token
        await sendAuthCookie(c, PlainSessionKey);
        await sendUserIdCookie(c, user.id.toString(), true);

        // Check if this is an internal request
        if (returnInternal) return user.id;

        return c.json({ message: 'User created successfully', status: 200 }, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function login(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');

    // Some idiot tries to log in when they're already logged in?
    if (userId && !isAnonymous) return c.json({ message: 'Already Logged In', status: 401 }, 401);

    // Get input data
    const { identifier, password }: { identifier: string, password: string } = await c.req.json();

    // Check if username or email is provided
    if (!identifier || !password) {
        return c.json({ message: 'Missing required fields', status: 400 }, 400);
    }

    // Check if username/email exists
    const user = await env.DB.prepare(`
        SELECT id, username, email, password, salt
        FROM user
        WHERE username = ?
           OR email = ?
    `).bind(identifier.toLowerCase(), identifier).first<UserRow>();
    if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

    // Verify password
    const match = await verifyPassword(password, user.salt, user.password);
    if (!match) return c.json({ message: 'Invalid credentials', status: 401 }, 401);

    // Get user data to send
    try {
        const userData = await env.DB.prepare(`
            SELECT *
            FROM user_view
            WHERE id = ?
        `).bind(user.id).first<UserView>();

        // Generate Session Key & Salt
        const PlainSessionKey = randomBytes(32).toString('hex');
        const sessionKey = await hashSessionKey(PlainSessionKey);

        // const { encoded: sessionKeyEncoded } = generateSalt();
        // const sessionKey = await hashSessionKey(PlainSessionKey, sessionKeyEncoded);

        // Insert into session table
        await env.DB.prepare(`
            INSERT INTO session (id, user_id, is_anonymous, ip)
            VALUES (?, ?, false, ?)
        `).bind(sessionKey, user.id, c.req.header('cf-connecting-ip') || '').run();

        // Send session key & token
        await sendAuthCookie(c, PlainSessionKey);
        await sendUserIdCookie(c, user.id.toString(), false);

        return c.json(userData, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function sendForgotPasswordEmail(c: Context) {
    const env: Env = c.env;
    // @ts-ignore
    const { email } = c.req.valid('json');

    // Get the user data
    const user = await env.DB.prepare(`
        SELECT id, username
        FROM user
        WHERE email = ?
    `).bind(email).first<UserRow>();

    // Check if user exists
    if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

    // Generate the reset token
    const token = randomBytes(32).toString('hex');

    // Insert into the database
    await env.DB.prepare(`
        INSERT INTO password_reset (token, user_id)
        VALUES (?, ?)
    `).bind(token, user.id).run();

    // Set the Email API token
    sgMail.setApiKey(env.EMAIL_API);

    // Generate the reset link
    const resetLink = `https://uaeu.chat/reset-password?token=${token}`;

    // Create the email message
    const msg = {
        to: email,
        from: 'no-reply@uaeu.chat',
        templateId: 'd-bca8e749fea948b5b3e45de04e728c7b',
        dynamicTemplateData: {
            username: user.username,
            reset_link: resetLink
        },
        isTransactional: true
    };

    // Send the email
    try {
        await sgMail.send(msg);
        return c.json({ message: 'Email sent', status: 200 }, 200);
    } catch (e: any) {
        console.error('Error sending email:', e);
        if (e.response) console.error(e.response.body.errors);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function resetPassword(c: Context) {
    const env: Env = c.env;
    const token = c.req.query('token');
    // @ts-ignore
    const { newPassword } = c.req.valid('json');

    // Check if data is provided and validate
    if (!token) return c.json({ message: 'Missing token', status: 400 }, 400);

    // Get the password reset data
    const passwordReset = await env.DB.prepare(`
        SELECT *
        FROM password_reset
        WHERE token = ?
    `).bind(token).first<PasswordResetRow>();

    // Validate
    if (!passwordReset) return c.json({
        message: 'Invalid token',
        status: 400
    }, 400);
    if (passwordReset.used) return c.json({ message: 'Token already used', status: 400 }, 400);
    if (passwordReset.created_at + (60 * 15) < Date.now() / 1000) return c.json({
        message: 'Token expired',
        status: 400
    }, 400);

    // Generate salt, encoded salt (for storing in db) & hash password with plain salt
    const { salt, encoded } = generateSalt();
    const hash = await hashPassword(newPassword, salt);

    // Update the user
    const user = await env.DB.prepare(`
        UPDATE user
        SET password = ?,
            salt     = ?
        WHERE id = ?
        RETURNING username, email
    `).bind(hash, encoded, passwordReset.user_id).first<UserRow>();

    // Make sure the user is valid
    if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

    c.executionCtx.waitUntil(Promise.all([

            // Set the password reset as used
            env.DB.prepare(`
                UPDATE password_reset
                SET used = true
                WHERE token = ?
            `).bind(token).run(),

            // Revoke all sessions
            env.DB.prepare(`
                DELETE
                FROM session
                WHERE user_id = ?
            `).bind(passwordReset.user_id).run(),

            // Send email
            sendPasswordChangedConfirmationEmail(c, user.username, user.email)
        ])
    );

    return c.json({ message: 'Password reset successfully', status: 200 }, 200);
}

export async function changePassword(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Some idiot tries to change password when they're not logged in
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get the password data
    // @ts-ignore
    const { currentPassword, newPassword } = c.req.valid('json');

    // Get the user data
    const user = await env.DB.prepare(`
        SELECT username, email, password, salt
        FROM user
        WHERE id = ?
    `).bind(userId).first<UserRow>();

    if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

    // Compare old password
    const match = await verifyPassword(currentPassword, user.salt, user.password);
    if (!match) return c.json({ message: 'Invalid credentials', status: 401 }, 401);

    // Generate salt, encoded salt (for storing in db) & hash password with plain salt
    const { salt, encoded } = generateSalt();
    const hash = await hashPassword(newPassword, salt);

    // Update the user
    await env.DB.prepare(`
        UPDATE user
        SET password = ?,
            salt     = ?
        WHERE id = ?
    `).bind(hash, encoded, userId).run();

    c.executionCtx.waitUntil(Promise.all([
            // Revoke all sessions
            env.DB.prepare(`
                DELETE
                FROM session
                WHERE user_id = ?
            `).bind(userId).run(),

            // Send email
            sendPasswordChangedConfirmationEmail(c, user.username, user.email)
        ])
    );

    return c.json({ message: 'Password changed successfully', status: 200 }, 200);
}

export async function logout(c: Context) {
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');

    // Some idiot tries to log out when they're not logged in
    if (!(userId && !isAnonymous)) return c.text('Not logged in', 401);

    // Set session key & token to empty and expire immediately
    await sendAuthCookie(c, '', 0);
    await sendUserIdCookie(c, '', false, 0);
    return c.text('Logged out', 200);
}

export async function forceLogout(c: Context) {
    // Do not check for user data, just erase cookies to force it
    // Set session key & token to empty and expire immediately
    await sendAuthCookie(c, '', 0);
    await sendUserIdCookie(c, '', false, 0);
    return c.text('Logged out', 200);
}

export async function authenticateUser(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;

    if (!userId) return c.json({ user: {} }, 200);

    try {
        // Get user from DB
        const user = await env.DB.prepare(`
            SELECT *
            FROM user_view
            WHERE id = ?
        `).bind(userId).first<UserRow>();

        // No user? impossible unless mohammad or hussain decided to delete the users table or destroy the backend in some other way
        if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

        // Set our signed userId & anonymous status token
        await sendUserIdCookie(c, userId.toString(), user.is_anonymous);

        // Return the user
        return c.json({ user: user, status: 200 }, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function sendEmailVerification(c: Context, internal: boolean = false) {
    const env: Env = c.env;

    if (internal) {
        // Internal call, get the user data from the context
        const userId = c.get('userId') as number;
        const username = c.get('username') as string;
        const email = c.get('email') as string;

        // Generate the verification token
        const token = randomBytes(32).toString('hex');

        // Insert into the database
        await env.DB.prepare(`
            INSERT INTO email_verification (token, user_id, email)
            VALUES (?, ?, ?)
        `).bind(token, userId, email).run();

        // Send the email
        await sendEmailVerificationEmail(c, email, username, token);
    } else {
        // External call, get userId from the middleware
        const userId = c.get('userId') as number;
        const isAnonymous = c.get('isAnonymous') as boolean;

        // Check if user is logged in
        if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

        // Get user data
        const user = await env.DB.prepare(`
            SELECT username, email, email_verified
            FROM user
            WHERE id = ?
        `).bind(userId).first<UserRow>();

        // No user? impossible unless mohammad or hussain decided to delete the users table or destroy the backend in some other way
        if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

        // Check if email is already verified
        if (user.email_verified) return c.json({ message: 'Email already verified', status: 400 }, 400);

        // Generate the verification token
        const token = randomBytes(32).toString('hex');

        // Insert into the database
        await env.DB.prepare(`
            INSERT INTO email_verification (token, user_id, email)
            VALUES (?, ?, ?)
        `).bind(token, userId, user.email).run();

        // Send the email
        await sendEmailVerificationEmail(c, user.email, user.username, token);
    }
}

export async function verifyEmail(c: Context) {
    const env: Env = c.env;
    const token = c.req.query('token');

    // Check if token is provided
    if (!token) return c.json({ message: 'Missing token', status: 400 }, 400);

    // Get the user data
    const emailVerification = await env.DB.prepare(`
        SELECT *
        FROM email_verification
        WHERE token = ?
    `).bind(token).first<EmailVerificationRow>();

    // Check if token is valid
    const expiresIn = 60 * 15; // 15 minutes
    if (!emailVerification) return c.json({ message: 'Invalid token', status: 400 }, 400);
    if (emailVerification.used) return c.json({ message: 'Token already used', status: 400 }, 400);
    if (emailVerification.created_at + (expiresIn) < Date.now() / 1000) return c.json({
        message: 'Token expired',
        status: 400
    }, 400);

    // Update the user
    await env.DB.prepare(`
        UPDATE user
        SET email_verified = true
        WHERE id = ?
    `).bind(emailVerification.user_id).run();

    // Set the email verification as used
    await env.DB.prepare(`
        UPDATE email_verification
        SET used = true
        WHERE token = ?
    `).bind(token).run();

    return c.json({ message: 'Email verified', status: 200 }, 200);
}

// MISC

async function sendEmailVerificationEmail(c: Context, to: string, username: string, token: string) {
    // Set the API Key
    const env: Env = c.env;
    sgMail.setApiKey(env.EMAIL_API);

    // Generate the verification link
    const verificationLink = `https://uaeu.chat/verify-email?token=${token}`;

    // Create the email message
    const msg = {
        to,
        from: 'no-reply@uaeu.chat',
        templateId: 'd-ea015cfe295f4d98bee1c188b2c57e93',
        dynamicTemplateData: {
            username,
            verification_link: verificationLink
        },
        isTransactional: true
    };

    try {
        await sgMail.send(msg);
        return c.json({ message: 'Email sent', status: 200 }, 200);
    } catch (e: any) {
        console.error('Error sending email:', e);
        if (e.response) console.error(e.response.body.errors);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }

}

async function sendPasswordChangedConfirmationEmail(c: Context, username: string, email: string) {
    // Set the API Key
    const env: Env = c.env;
    sgMail.setApiKey(env.EMAIL_API);

    // Create the email message
    const msg = {
        to: email,
        from: 'no-reply@uaeu.chat',
        templateId: 'd-8704060f13b54d1e91aaec50bfd71f0e',
        dynamicTemplateData: {
            username
        },
        isTransactional: true
    };

    // Send the email
    try {
        await sgMail.send(msg);
    } catch (e: any) {
        console.error('Error sending email:', e);
        if (e.response) console.error(e.response.body.errors);
    }
}
