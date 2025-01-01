import { Context } from 'hono';
import { z } from 'zod';
import { getSignedCookie, setCookie } from 'hono/cookie';
import { generateSalt, hashPassword, hashSessionKey, verifyPassword } from '../util/crypto';
import { getUserFromSessionKey, sendAuthCookie } from '../util/util';
import { userSchema } from '../util/validationSchemas';

/* User Authentication */

// Simple check if this user has a session key or not
export async function isUser(c: Context) {
    const sessionKey = await getSignedCookie(c, c.env.JWT_SECRET, 'sessionKey') as string;
    if (!sessionKey) return c.json({ message: 'Unauthorized', status: 401 }, 401);
    return c.json({ message: 'Authorized', status: 200 }, 200);
}

// Check if this user is anonymous
export async function isAnon(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, c.env.JWT_SECRET, 'sessionKey') as string;

    // Not a user
    if (!sessionKey) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get user ID from session key
    const userId = await getUserFromSessionKey(c, sessionKey);

    try {
        const user = await env.DB.prepare(`
            SELECT is_anonymous
            FROM user
            WHERE id = ?
        `).bind(userId).first<UserView>();

        if (!user) return c.json({ message: 'Unauthorized', status: 401 }, 401);

        if (user.is_anonymous) {
            return c.json({ message: 'Anonymous', anon: true, status: 200 }, 200);
        } else {
            return c.json({ message: 'Not Anonymous', anon: false, status: 200 }, 200);
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', 500);
    }
}

export async function signup(c: Context) {
    const env: Env = c.env;
    const { displayname, email, username, password, includeAnon } = await c.req.json();
    const existingSessionKey = await getSignedCookie(c, c.env.JWT_SECRET, 'sessionKey') as string;

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
        // Check if the user signing up already has anonymous activity
        if (includeAnon) {
            if (existingSessionKey) {
                // We have a session key. Check if this is not a normal user.
                // Get UserID from Session key
                const userid = await getUserFromSessionKey(c, existingSessionKey);

                // Get if user is anonymous
                const isAnon = await env.DB.prepare(`
                    SELECT is_anonymous
                    FROM user
                    WHERE id = ?
                `).bind(userid).first<UserRow>();

                // Some idiot tries to sign up as anon when they're already logged in
                if (!isAnon) return c.json({ message: 'Already Logged In', status: 401 }, 401);

                // Anon user, continue by updating the user
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
                `).bind(username, (displayname ? displayname : username), email, hash, encoded, userid).first<UserRow>();

                if (!user) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

                await sendAuthCookie(c, existingSessionKey);
                return c.json({ message: 'User updated successfully', status: 200 }, 200);
            } else {
                // No session key, this is an error
                return c.json({ message: 'Unauthorized', status: 401 }, 401);
            }
        } else {
            // New user, no activity
            const user = await env.DB.prepare(`
                INSERT INTO user (username, displayname, email, password, salt)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id, username, displayname, created_at, bio, pfp, is_anonymous
            `).bind(username, (displayname ? displayname : username), email, hash, encoded).first<UserView>();

            if (!user) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

            const PlainSessionKey = crypto.randomUUID();
            const sessionKey = await hashSessionKey(PlainSessionKey);

            await env.DB.prepare(`
                INSERT INTO session (id, user_id)
                VALUES (?, ?)
            `).bind(sessionKey, user.id).run();

            await sendAuthCookie(c, PlainSessionKey);

            return c.json(user, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function anonSignup(c: Context) {
    const env: Env = c.env;

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

        // Insert into session table
        await env.DB.prepare(`
            INSERT INTO session (id, user_id)
            VALUES (?, ?)
        `).bind(sessionKey, user.id).run();

        // Send the session key to the client
        await sendAuthCookie(c, PlainSessionKey);
        c.set('sessionKey', PlainSessionKey);

        return c.json({ message: 'User created successfully', status: 200 }, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function login(c: Context) {
    const env: Env = c.env;
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

        // Generate session key & hash it
        const PlainSessionKey = crypto.randomUUID();
        const sessionKey = await hashSessionKey(PlainSessionKey);

        // Insert into session table
        await env.DB.prepare(`
            INSERT INTO session (id, user_id)
            VALUES (?, ?)
        `).bind(sessionKey, user.id).run();

        // Send the session key to the client
        await sendAuthCookie(c, PlainSessionKey);

        return c.json(userData, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function logout(c: Context) {
    // Set session key to empty and expire immediately
    setCookie(c, 'sessionKey', '', { maxAge: 0 });
    return c.text('Logged out', 200);
}

/* User information */

export async function getUserByUsername(c: Context) {
    // api.uaeu.chat/user/:username
    const env: Env = c.env;
    const username: string = c.req.param('username');

    // This is likely impossible but yeah
    if (username === '') return c.text('Bad Request', 400);

    try {
        // Get user data
        const result: UserView | null = await env.DB.prepare(
            'SELECT * FROM user_view WHERE username = ?'
        ).bind(username.toLowerCase()).first<UserView>();
        // No result found, 404
        if (!result) return c.json({ message: 'User not found', status: 404 }, 404);
        // Result found, return it
        return c.json(result, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserBySessionKey(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Get user ID from session key
    const userId = await getUserFromSessionKey(c, sessionKey);
    if (!userId) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    try {
        // Get user data
        const user = await env.DB.prepare(
            'SELECT * FROM user_view WHERE id = ?'
        ).bind(userId).first<UserView>();
        // User not found, return 404
        if (!user) return c.json({ message: 'User not found', status: 404 }, 404);
        // User found, return it
        return c.json(user, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserLikesOnPosts(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    try {
        // Get user ID from session key
        const userId = await getUserFromSessionKey(c, sessionKey);
        if (!userId) return c.json({ message: 'Unauthorized', status: 401 }, 401);

        // Get user likes
        const likes = await env.DB.prepare(`
            SELECT post_id
            FROM post_like
            WHERE user_id = ?
        `).bind(userId).all<PostLikeRow>();

        return c.json(likes.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserLikesOnComments(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    try {
        // Get user ID from session key
        const userId = await getUserFromSessionKey(c, sessionKey);
        if (!userId) return c.json({ message: 'Unauthorized', status: 401 }, 401);

        // Get user likes
        const likes = await env.DB.prepare(`
            SELECT comment_id
            FROM comment_like
            WHERE user_id = ?
        `).bind(userId).all<CommentLikeRow>();

        return c.json(likes.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserLikesOnSubcomments(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    try {
        // Get user ID from session key
        const userId = await getUserFromSessionKey(c, sessionKey);
        if (!userId) return c.json({ message: 'Unauthorized', status: 401 }, 401);

        // Get user likes
        const likes = await env.DB.prepare(`
            SELECT subcomment_id
            FROM subcomment_like
            WHERE user_id = ?
        `).bind(userId).all<SubcommentLikeRow>();

        return c.json(likes.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}
