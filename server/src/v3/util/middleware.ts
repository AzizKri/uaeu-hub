import { createMiddleware } from 'hono/factory';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { anonSignup } from '../controllers/user.controller';

export const authMiddleware = createMiddleware(
    async (c, next) => {
        const sessionKey = await getSignedCookie(c, c.env.JWT_SECRET, "sessionKey");

        console.log(sessionKey);
        // If we have a session key, then this user already has activity. Is either signed in or an anonymous user

        if (!sessionKey) {
            // First interaction, sign up as anonymous
            await anonSignup(c)
        } else {
            // Existing user, just renew the key
            const COOKIE_EXPIRY = 360 * 24 * 60 * 60; // 1 year
            await setSignedCookie(c, 'sessionKey', sessionKey.toString(), c.env.JWT_SECRET, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                domain: '.uaeu.chat',
                maxAge: COOKIE_EXPIRY
            });
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

export const uploadAttachmentateLimitMiddleware = createMiddleware(
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
