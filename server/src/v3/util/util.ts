import { Context } from 'hono';
import { hashSessionKey } from './crypto';
import { anonSignup } from '../controllers/auth.controller';
import { setSignedCookie } from 'hono/cookie';

/**
 * @Create A new anonymous user IF `createNewUser` is `true` and no `sessionKey` is provided.
 *
 * @returns `{ userId, isAnonymous }` or `null`
 *
 * @Note `userId` and `isAnonymous` is returned if provided with a sessionKey associated with a valid user. `null` values must be handled properly when expected.
 */
export async function getUserFromSessionKey(c: Context, sessionKey: string | undefined, createNewUser: boolean = false): Promise<UserAnonymousStatus | null> {
    const env: Env = c.env;

    console.log('getUserFromSessionKey: ', sessionKey);
    // New user, no session key
    if (!sessionKey) {
        // User is required (e.g. for likes, posts, etc.)
        if (createNewUser) {
            console.log('getUserFromSessionKey -> signupAnon');
            const userId = await anonSignup(c, true) as number;
            return { userId: userId, isAnonymous: true };
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
            `SELECT user_id, is_anonymous
             FROM session
             WHERE id = ?`
        ).bind(hashedKey).first<SessionRow>();
        console.log('getUserFromSessionKey -> userResult: ', userResult);

        // If user not found, create a new user. Normally this wouldn't happen, currently only for testing
        // TODO Need to reconsider this later
        if (!userResult) {
            console.log('getUserFromSessionKey -> User not found');
            const userId = await anonSignup(c, true) as number;
            return { userId: userId, isAnonymous: true };
        }

        // Return user ID
        return { userId: userResult.user_id, isAnonymous: userResult.is_anonymous };
    } catch (e) {
        console.log(e);
        return null;
    }
}

export function getUserFromSessionToken(sessionToken: string | undefined): UserAnonymousStatus | null {
    if (!sessionToken) return null;

    // Split the session token
    const [userIdStr, isAnonymousStr] = sessionToken.split(':');
    const userId = Number(userIdStr);
    const isAnonymous = Number(isAnonymousStr);

    // If the user ID is not a number, then it's an invalid token
    if (isNaN(userId) || isNaN(isAnonymous)) {
        console.log('getUserFromSessionToken -> Invalid token');
        return null;
    }

    return { userId: userId, isAnonymous: isAnonymous == 1 };
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
        secure: true,
        sameSite: 'None',
        maxAge: (customExpires !== null) ? customExpires as number : COOKIE_EXPIRY
    };

    // If in production, set domain to .uaeu.chat & sameSite to Strict
    if (c.env.ENVIRONMENT === 'production') {
        options.domain = '.uaeu.chat';
        options.sameSite = 'Strict';
    }

    // Set the cookie
    await setSignedCookie(c, 'sessionKey', sessionKey.toString(), c.env.JWT_SECRET, options);
}

/**
 * Send the `sessionToken` to the client as a signed cookie.
 *
 * `sessionToken` is the userId.
 */
export async function sendUserIdCookie(c: Context, userId: string, isAnonymous: boolean, customExpires?: number): Promise<void> {
    const COOKIE_EXPIRY = 30 * 60; // 30 minutes

    // Prepare cookie options
    const options: cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: (customExpires !== null) ? customExpires as number : COOKIE_EXPIRY
    };

    // If in production, set domain to .uaeu.chat & sameSite to Strict
    if (c.env.ENVIRONMENT === 'production') {
        options.domain = '.uaeu.chat';
        options.sameSite = 'Strict';
    }

    // Set the cookie
    await setSignedCookie(c, 'sessionToken', `${userId}:${Number(isAnonymous)}`, c.env.JWT_SECRET, options);
}
