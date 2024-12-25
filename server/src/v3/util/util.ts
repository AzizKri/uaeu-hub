import { Context } from 'hono';
import { hashSessionKey } from './crypto';
import { anonSignup } from '../controllers/user.controller';
import { setSignedCookie } from 'hono/cookie';

/**
 * @Create A new anonymous user IF `createNewUser` is `true` and no `sessionKey` is provided.
 *
 * @returns `userId` or `null`
 *
 * @Note `userId` is returned if provided with a sessionKey associated with a valid user. `null` values must be handled properly when expected.
 */
export async function getUserFromSessionKey(c: Context, sessionKey: string | undefined, createNewUser: boolean = false): Promise<number | null> {
    const env: Env = c.env;

    console.log('getUserFromSessionKey: ', sessionKey);
    // New user, no session key
    if (!sessionKey) {
        // User is required (e.g. for likes, posts, etc.)
        if (createNewUser) {
            console.log('getUserFromSessionKey -> signupAnon');
            return await signupAnon(c);
        } else {
            // User is not required. This is for GETTING posts, comments, etc. Just return null and handle null in the controller
            console.log('getUserFromSessionKey -> No SK, no create');
            return null;
        }
    }

    // Hash session key
    const hashedKey = await hashSessionKey(sessionKey);
    console.log('getUserFromSessionKey -> hashedKey: ', hashedKey);

    try {
        // Get user from session key
        let userResult = await env.DB.prepare(
            `SELECT user_id
             FROM session
             WHERE id = ?`
        ).bind(hashedKey).first<SessionRow>();
        console.log('getUserFromSessionKey -> userResult: ', userResult);

        // If user not found, create a new user. Normally this wouldn't happen, currently only for testing
        // Need to reconsider this later
        if (!userResult) {
            console.log('getUserFromSessionKey -> User not found');
            return await signupAnon(c);
        }

        // Return user ID
        return userResult.user_id;
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * @Create A new anonymous user and return a `userId` or `null` on Error.
 *
 * @returns `userId` or `null`
 *
 * @Note The `userId` is always returned as it creates a new anonymous user.
 */
async function signupAnon(c: Context): Promise<number | null> {
    const env: Env = c.env;

    // Normal signup logic. This is for the DB.
    await anonSignup(c);

    // Get cookie from context & hash it
    const sessionKey = c.get('sessionKey');
    console.log('signupAnon -> sessionKey: ', sessionKey);
    const newHashedKey = await hashSessionKey(sessionKey);

    try {
        // Get user from session key
        const userResult = await env.DB.prepare(
            `SELECT user_id
             FROM session
             WHERE id = ?`
        ).bind(newHashedKey).first<SessionRow>();

        // Return user ID
        return userResult!.user_id;
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * Send the `sessionKey` to the client as a signed cookie.
 *
 * `sessionKey` is sent in PLAINTEXT.
 */
export async function sendAuthCookie(c: Context, sessionKey: string, customExpires?: number): Promise<void> {
    const COOKIE_EXPIRY = 360 * 24 * 60 * 60; // 1 year

    // Prepare cookie options
    const options: cookieOptions = {
        httpOnly: true,
        secure: c.env.ENVIRONMENT !== 'development',
        sameSite: 'Strict',
        maxAge: customExpires || COOKIE_EXPIRY
    };

    // If in production, set domain to .uaeu.chat & sameSite to Strict
    if (c.env.ENVIRONMENT === 'production') {
        options.domain = '.uaeu.chat';
    } else {
        options.domain = 'localhost';
    }

    // Set the cookie
    await setSignedCookie(c, 'sessionKey', sessionKey.toString(), c.env.JWT_SECRET, options);
}
