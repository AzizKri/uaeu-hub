import { createMiddleware } from 'hono/factory';
import { getSignedCookie } from 'hono/cookie';
import { anonSignup } from '../controllers/auth.controller';
import { getUserFromSessionKey, sendAuthCookie, sendUserIdCookie } from './util';
import { Context } from 'hono';

/**
 * @sets `{ userId, isAnonymous }` on the context ONLY IF there is a valid user
 */
export const authMiddlewareCheckOnly = createMiddleware(
    async (c, next) => {
        console.log('AUTH MIDDLEWARE CHECK ONLY');

        // Check if the user is authenticated without creating a new anon user
        await sharedAuthMiddleware(c, true);

        // Authentication done, go to next middleware/controller
        await next();
    }
);

/**
 * @sets `{ userId, isAnonymous }` on the context
 *
 * @creates a new anonymous user if the user is not authenticated
 */
export const authMiddleware = createMiddleware(
    async (c, next) => {
        console.log('AUTH MIDDLEWARE');

        // Check if the user is authenticated, create a new anon user if invalid
        await sharedAuthMiddleware(c, false);

        // Authentication done, go to next middleware/controller
        await next();
    }
);

async function sharedAuthMiddleware(c: Context, checkOnly: boolean) {
    // Begin with checking the session key before token. No token without key
    let sessionKey = await getSignedCookie(c, c.env.EN_SECRET, 'sessionKey') as string;
    const sessionKeyJWT = await getSignedCookie(c, c.env.JWT_SECRET, 'sessionKey') as string;

    console.log('authMiddleware -> sessionKey', sessionKey);
    console.log('authMiddleware -> sessionKeyJWT', sessionKeyJWT);

    if (!sessionKey && sessionKeyJWT) sessionKey = sessionKeyJWT;

    if (!sessionKey) {
        console.log('authMiddleware -> No session key');

        // No session key, first interaction. Do we want to check only?
        if (checkOnly) return;

        // Sign up as anonymous
        const userId = await anonSignup(c, true) as number;

        c.set('userId', userId);
        c.set('isAnonymous', true);
    } else {
        console.log('authMiddleware -> sessionKey');

        // There is a session key, check if there's a valid token
        let sessionToken = await getSignedCookie(c, c.env.EN_SECRET, 'sessionToken') as string;
        const sessionTokenJWT = await getSignedCookie(c, c.env.JWT_SECRET, 'sessionToken') as string;

        console.log('authMiddleware -> sessionKey -> sessionToken', sessionToken);
        console.log('authMiddleware -> sessionKey -> sessionTokenJWT', sessionTokenJWT);

        if (!sessionToken && sessionTokenJWT) sessionToken = sessionTokenJWT;

        if (sessionToken) {
            console.log('authMiddleware -> sessionKey -> sessionToken');

            const [userIdStr, isAnonymousStr] = sessionToken.split(':');
            const userId = Number(userIdStr);
            const isAnonymous = Number(isAnonymousStr);

            console.log('authMiddleware -> sessionKey -> sessionToken -> userId', userId);
            console.log('authMiddleware -> sessionKey -> sessionToken -> isAnonymous', isAnonymous);

            // If the user ID is not a number, then it's an invalid token
            if (isNaN(userId) || isNaN(isAnonymous)) {
                console.log('authMiddleware -> sessionKey -> sessionToken -> Invalid token');
                // Do we want to check only?
                if (checkOnly) return;
                // Invalid token, sign up as anonymous
                await anonSignup(c);
            } else {
                console.log('authMiddleware -> sessionKey -> sessionToken -> Valid token');
                // Both are valid, send em
                c.set('userId', userId);
                c.set('isAnonymous', isAnonymous == 1);
            }
        } else {
            // Existing user. Is the user valid?
            const userFromSessionKey = await getUserFromSessionKey(c, sessionKey);

            if (!userFromSessionKey) {
                // Do we want to check only?
                if (checkOnly) return;
                // Invalid user, sign up as anonymous
                const userId = await anonSignup(c, true) as number;
                c.set('userId', userId);
                c.set('isAnonymous', true);
            } else {
                // Valid user, send auth cookie
                await sendAuthCookie(c, sessionKey);
                await sendUserIdCookie(c, userFromSessionKey.userId.toString(), userFromSessionKey.isAnonymous);
                c.set('userId', userFromSessionKey.userId);
                c.set('isAnonymous', true);
            }
        }

    }
}

export const postRateLimitMiddleware = createMiddleware(
    async (c, next) => {
        const env: Env = c.env;
        const sessionKey = await getSignedCookie(c, env.EN_SECRET, 'sessionKey') as string;
        const { success } = await env.POSTS_RL.limit({ key: `postRequests_${sessionKey}` });
        if (!success) {
            return c.json({ success: false, message: 'Rate limit exceeded', status: 429, results: [] }, 429);
        }

        await next();
    }
);

export const uploadAttachmentLimitMiddleware = createMiddleware(
    async (c, next) => {
        const env: Env = c.env;
        const sessionKey = await getSignedCookie(c, env.EN_SECRET, 'sessionKey') as string;
        const { success } = await env.ATTACHMENT_RL.limit({ key: `postRequests_${sessionKey}` });
        if (!success) {
            return c.json({ success: false, message: 'Rate limit exceeded', status: 429, results: [] }, 429);
        }

        await next();
    }
);

export const textContentModerationMiddleware = createMiddleware(
    async (c, next) => {
        let content;

        // Parser FormBody
        if (c.req.header('Content-Type')?.includes('multipart/form-data') || c.req.header('Content-Type')?.includes('application/x-www-form-urlencoded')) {
            const formData = await c.req.parseBody();
            content = formData['content'] as string;
        } else {
            return c.json({ message: 'Unsupported content type', status: 400 }, 400);
        }

        // No content?
        if (!content) return c.json({ message: 'No content provided', status: 400 }, 400);

        // 1984
        // TODO Currently unimplemented, thinking whether we want to do this or not

        c.set('moderatedContent', content);

        await next();
    }
);
