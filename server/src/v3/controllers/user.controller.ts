import { Context } from 'hono';
import { z } from 'zod';
import { getSignedCookie } from 'hono/cookie';
import { generateSalt, hashPassword, hashSessionKey, verifyPassword } from '../util/crypto';
import { getUserFromSessionKey, sendAuthCookie } from '../util/util';

/* User Authentication */

const displaynameSchema = z
    .string()
    .min(3, 'Display name must be at least 3 characters long')
    .max(32, 'Display name must be at most 32 characters long')
    .optional();

const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20)
    .regex(/^[a-zA-Z0-9.\-_]+$/,
        'Username can only contain alphanumeric characters, underscores, dashes, and dots, but not consecutively');

const emailSchema = z
    .string()
    .email('Invalid email address');

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must be at most 72 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[ !"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}]/, 'Password must contain at least one special character');

const userSchema = z.object({
    displayname: displaynameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema
});


export async function isUser(c: Context) {
    const sessionKey = await getSignedCookie(c, c.env.JWT_SECRET, 'sessionKey') as string;
    if (!sessionKey) return c.json({ message: 'Unauthorized', status: 401 }, 401);
    return c.json({ message: 'Authorized', status: 200 }, 200);
}

// api.uaeu.chat/user/signup
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
        if (existingSessionKey && includeAnon == true) { // We have a session key AND we want to include anonymous activity
            // Get UserID from Session key
            const userid = await getUserFromSessionKey(c, existingSessionKey);

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
            // New user, no activity
            const user = await env.DB.prepare(`
                INSERT INTO user (username, displayname, email, password)
                VALUES (?, ?, ?, ?)
                RETURNING id
            `).bind(username, (displayname ? displayname : username), email, hash).first<UserRow>();

            if (!user) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

            const PlainSessionKey = crypto.randomUUID();
            const sessionKey = await hashSessionKey(PlainSessionKey);

            await env.DB.prepare(`
                INSERT INTO session (id, user_id)
                VALUES (?, ?)
            `).bind(sessionKey, user.id).run();

            await sendAuthCookie(c, PlainSessionKey);

            return c.json({ message: 'User created successfully', status: 200 }, 200);
        }
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

// api.uaeu.chat/user/anon
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
    const { username, email, password } = await c.req.json();

    if ((!username && !email) || !password) {
        return c.json({ message: 'Missing required fields', status: 400 }, 400);
    }

    let user;
    if (username) {
        user = await env.DB.prepare(`
            SELECT id, username, password, salt
            FROM user
            WHERE username = ?
        `).bind(username).first<UserRow>();
    } else if (email) {
        user = await env.DB.prepare(`
            SELECT id, email, password, salt
            FROM user
            WHERE email = ?
        `).bind(email).first<UserRow>();
    }

    if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

    const match = await verifyPassword(password, user.salt, user.password);

    if (!match) return c.json({ message: 'Invalid credentials', status: 401 }, 401);

    const PlainSessionKey = crypto.randomUUID();
    const sessionKey = await hashSessionKey(PlainSessionKey);

    await env.DB.prepare(`
        INSERT INTO session (id, user_id)
        VALUES (?, ?)
    `).bind(sessionKey, user.id).run();

    await sendAuthCookie(c, PlainSessionKey);

    return c.json({ message: 'Logged in successfully', status: 200 }, 200);
}

/* User information */

export async function getByUsername(c: Context) {
    // api.uaeu.chat/user/:username
    const env: Env = c.env;
    const username = c.req.param('username');

    // This is likely impossible but yeah
    if (username === '') return c.text('Bad Request', 400);

    try {
        const result = await env.DB.prepare(
            'SELECT * FROM user_view WHERE username = ?'
        ).bind(username).all<UserView>();
        return Response.json(result);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}
