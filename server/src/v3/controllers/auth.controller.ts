import { Context } from 'hono';
import { getSignedCookie } from 'hono/cookie';
import { z } from 'zod';
import { isUsernameValid, userSchema } from '../util/validationSchemas';
import { sendAuthCookie, sendUserIdCookie } from '../util/util';
import { generateSalt, hashPassword, hashSessionKey, verifyPassword } from '../util/crypto';

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
            const PlainSessionKey = crypto.randomUUID();
            const sessionKey = await hashSessionKey(PlainSessionKey);

            // const { encoded: sessionKeyEncoded } = generateSalt();
            // const sessionKey = await hashSessionKey(PlainSessionKey, sessionKeyEncoded);

            // Insert session key into session table & add as member of the general community
            c.executionCtx.waitUntil(Promise.resolve(async () => {
                    // Insert into session table
                    await env.DB.prepare(`
                        INSERT INTO session (id, user_id, is_anonymous, ip)
                        VALUES (?, ?, false, ?)
                    `).bind(sessionKey, user.id, c.req.header('cf-connecting-ip') || '').run();

                    // Add user to general community
                    await env.DB.prepare(`
                        INSERT INTO user_community (user_id, community_id, role_id)
                        VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
                    `).bind(user.id).run();
                }
            ));

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
    const userId = c.get('userId') as number;

    // Some idiot tries to log in when they're already logged in?
    if (userId) return c.json({ message: 'Already Logged In', status: 401 }, 401);

    // Get the token
    const { credential } = await c.req.json();
    if (!credential) return c.json({ message: 'Missing required fields', status: 400 }, 400);

    // Verify
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);

    // Get data & validate
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
            const PlainSessionKey = crypto.randomUUID();
            const sessionKey = await hashSessionKey(PlainSessionKey);

            c.executionCtx.waitUntil(Promise.resolve(async () => {
                    await env.DB.prepare(`
                        INSERT INTO session (id, user_id, is_anonymous, ip)
                        VALUES (?, ?, false, ?)
                    `).bind(sessionKey, user.id, c.req.header('cf-connecting-ip') || '').run();
                })
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
                INSERT INTO user (username, displayname, email, email_verified, google_id, pfp)
                VALUES (?, ?, ?, true, ?, ?)
                RETURNING id, username, displayname, bio, email, pfp, is_anonymous
            `).bind(username, name, email, sub, picture).first<UserView>();

            // I have trust issues
            if (!newUser) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

            // Generate session key & token
            const PlainSessionKey = crypto.randomUUID();
            const sessionKey = await hashSessionKey(PlainSessionKey);

            // Send cookies
            await sendAuthCookie(c, PlainSessionKey);
            await sendUserIdCookie(c, newUser.id.toString(), false);

            c.executionCtx.waitUntil(Promise.resolve(async () => {
                // Insert into session table
                await env.DB.prepare(`
                    INSERT INTO session (id, user_id, is_anonymous, ip)
                    VALUES (?, ?, false, ?)
                `).bind(sessionKey, newUser.id, c.req.header('cf-connecting-ip') || '').run();

                // Add user to general community
                await env.DB.prepare(`
                    INSERT INTO user_community (user_id, community_id, role_id)
                    VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
                `).bind(newUser.id).run();
            }));

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
        const PlainSessionKey = crypto.randomUUID();
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
        const PlainSessionKey = crypto.randomUUID();
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
