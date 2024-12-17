import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { z } from 'zod';

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
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[ !"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}]/, "Password must contain at least one special character");

const userSchema = z.object({
    displayname: displaynameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});


// api.uaeu.chat/user/signup
export async function signup(c: Context) {
    const env: Env = c.env;
    const { displayname, email, username, password } = await c.req.json();

    try {
        userSchema.parse({ displayname, email, username, password });
    } catch (e) {
        if (e instanceof z.ZodError) {
            const errors = e.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        } else {
            return c.json({ message: 'Internal Server Error', status: 500 }, 500)
        }
    }

    // if (!email || !username || !password) {
    //     return c.json({ message: 'Missing required fields', status: 400 }, 400);
    // }
    const existingUser = await env.DB.prepare(`
        SELECT username
        FROM user
        WHERE username = ?
           OR email = ?`).bind(username, email).all<UserRow>();

    if (existingUser.results.length != 0) return c.json({ message: 'User already exists', status: 409 }, 409);

    const hash = await bcrypt.hash(password, 10); // (password, salt)

    try {
        const user = await env.DB.prepare(`
            INSERT INTO user (username, displayname, email, password)
            VALUES (?, ?, ?, ?)
            RETURNING id
        `).bind(username, (displayname? displayname : username), email, hash).first<UserRow>()

        if (!user) return c.json({ message: 'Internal Server Error', status: 500 }, 500);

        const payload = {
            id: user.id,
            username: username,
            email: email,
            exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // Expire in 30 days
        };

        const token = await sign(payload, env.JWT_SECRET);
        return c.json({ token, message: 'User created successfully', status: 200 }, 200);
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
            SELECT username, password
            FROM user
            WHERE username = ?
        `).bind(username).first<UserRow>();
    } else if (email) {
        user = await env.DB.prepare(`
            SELECT email, password
            FROM user
            WHERE email = ?
        `).bind(email).first<UserRow>();
    }

    if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

    const match = await bcrypt.compare(password, user.password);

    if (!match) return c.json({ message: 'Invalid credentials', status: 401 }, 401);

    const payload = {
        id: user.id,
        username: username,
        email: email,
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // Expire in 30 days
    };

    const token = await sign(payload, env.JWT_SECRET);
    return c.json({ token, message: 'Logged in successfully', status: 200 }, 200);
}

// export async function generateAnonSessionId(c: Context) {
// 	// api.uaeu.chat/user/anon
// 	const env: Env = c.env;
// 	const sessionId: number = Math.floor(Math.random() * Date.now());
//
// 	try {
// 		await env.DB.prepare(
// 			`INSERT INTO user (username, displayname, email)
// 			 VALUES (?, ?, ?)
// 			 RETURNING username`
// 		).bind(sessionId, 'Anonymous', '@').all<UserRow>();
//
// 		return new Response('Generated session ID', { status: 200,
// 			headers: {
// 				'Set-cookie': `session-id=${sessionId.toString()}; Path=/; Max-Age=31536000; SameSite=None; Secure`,
// 			}
// 		});
// 	} catch (e) {
// 		console.log(e);
// 		return new Response('Internal Server Error', { status: 500 });
// 	}
// }

export async function Authenticate(c: Context) {
    // api.uaeu.chat/v2/user/authenticate
    console.log(c);
    return new Response('Not implemented', { status: 501 });
    // TODO: Implement authentication
}

/* User information */

export async function getByUsername(c: Context) {
    // api.uaeu.chat/user/:username
    const env: Env = c.env;
    const username = c.req.param('username');

    // This is likely impossible but yeah
    if (username === '') throw new HTTPException(400, { res: new Response('No username defined', { status: 400 }) });

    try {
        const result = await env.DB.prepare(
            'SELECT * FROM user_view WHERE username = ?'
        ).bind(username).all<UserRow>();
        return Response.json(result);
    } catch (e) {
        console.log(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}
