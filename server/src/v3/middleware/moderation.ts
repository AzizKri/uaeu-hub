import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

export const textContentModerationMiddleware = createMiddleware(
    async (c: Context, next) => {
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
