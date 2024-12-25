import { createMiddleware } from 'hono/factory';
import { getSignedCookie } from 'hono/cookie';
import { anonSignup } from '../controllers/user.controller';
import { getUserFromSessionKey, sendAuthCookie } from './util';

export const authMiddleware = createMiddleware(
    async (c, next) => {
        const sessionKey = await getSignedCookie(c, c.env.JWT_SECRET, "sessionKey") as string;

        console.log(sessionKey);
        // If we have a session key, then this user already has activity. Is either signed in or an anonymous user

        if (!sessionKey) {
            // First interaction, sign up as anonymous
            await anonSignup(c)
        } else {
            // Existing user. Is the user valid?
            const userId = await getUserFromSessionKey(c, sessionKey);

            if (!userId) {
                // Invalid user, sign up as anonymous
                await anonSignup(c);
            } else {
                // Valid user, send auth cookie
                await sendAuthCookie(c, sessionKey);
            }
        }

        // Authentication done, go to next middleware/controller
        await next();
    }
);

export const postRateLimitMiddleware = createMiddleware(
    async (c, next) => {
        const env: Env = c.env;
        const ipAddress: string = c.req.header('cf-connecting-ip') || '';
        const { success } = await env.POSTS_RL.limit({ key: `postRequests_${ipAddress}` });
        if (!success) {
            return c.json({ success: false, message: 'Rate limit exceeded', status: 429, results: [] }, 429);
        }

        await next();
    }
);

export const uploadAttachmentLimitMiddleware = createMiddleware(
    async (c, next) => {
        const env: Env = c.env;
        const ipAddress: string = c.req.header('cf-connecting-ip') || '';
        const { success } = await env.ATTACHMENT_RL.limit({ key: `postRequests_${ipAddress}` });
        if (!success) {
            return c.json({ success: false, message: 'Rate limit exceeded', status: 429, results: [] }, 429);
        }

        await next();
    }
);
