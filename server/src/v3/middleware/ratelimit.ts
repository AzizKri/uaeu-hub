import { createMiddleware } from 'hono/factory';
import { getSignedCookie } from 'hono/cookie';
import { Context } from 'hono';

export const postRateLimitMiddleware = createMiddleware(
    async (c: Context, next) => {
        const env: Env = c.env;
        const sessionKey = await getSignedCookie(c, env.EN_SECRET, 'sessionKey') as string;
        const { success } = await env.POSTS_RL.limit({ key: `postRequests_${sessionKey}` });
        if (!success) {
            return c.json({ success: false, message: 'Rate limit exceeded', status: 429, results: [] }, 429);
        }

        await next();
    }
);

export const getPostsRateLimitMiddleware = createMiddleware(
    async (c: Context, next) => {
        const env: Env = c.env;
        const sessionKey = await getSignedCookie(c, env.EN_SECRET, 'sessionKey') as string;
        console.log(sessionKey);
        // TODO

        await next();
    }
)

export const uploadAttachmentLimitMiddleware = createMiddleware(
    async (c: Context, next) => {
        const env: Env = c.env;
        const sessionKey = await getSignedCookie(c, env.EN_SECRET, 'sessionKey') as string;
        const { success } = await env.ATTACHMENT_RL.limit({ key: `postRequests_${sessionKey}` });
        if (!success) {
            return c.json({ success: false, message: 'Rate limit exceeded', status: 429, results: [] }, 429);
        }

        await next();
    }
);
