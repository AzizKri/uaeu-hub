import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

/**
 * Middleware to check if a user is banned or suspended
 * Sets 'isBanned', 'isSuspended', and 'suspendedUntil' on context
 * This should be called after authentication middleware
 */
export const penaltyCheckMiddleware = createMiddleware(
    async (c: Context, next) => {
        const userId = c.get('userId') as number | undefined;

        // No user, no penalty check needed
        if (!userId) {
            await next();
            return;
        }

        const env: Env = c.env;

        try {
            const user = await env.DB.prepare(`
                SELECT is_banned, suspended_until FROM user WHERE id = ?
            `).bind(userId).first<{ is_banned: number; suspended_until: number | null }>();

            if (user) {
                // Check if banned
                if (user.is_banned === 1) {
                    c.set('isBanned', true);
                }

                // Check if suspended (and suspension hasn't expired)
                const now = Math.floor(Date.now() / 1000);
                if (user.suspended_until && user.suspended_until > now) {
                    c.set('isSuspended', true);
                    c.set('suspendedUntil', user.suspended_until);
                } else if (user.suspended_until && user.suspended_until <= now) {
                    // Suspension has expired, clear it
                    await env.DB.prepare(`
                        UPDATE user SET suspended_until = NULL WHERE id = ?
                    `).bind(userId).run();
                }
            }
        } catch (e) {
            console.error('penaltyCheckMiddleware error:', e);
        }

        await next();
    }
);

/**
 * Middleware to block write operations for suspended/banned users
 * Should be used on POST/PUT/DELETE routes that create/modify content
 */
export const blockPenalizedUserMiddleware = createMiddleware(
    async (c: Context, next) => {
        const isBanned = c.get('isBanned') as boolean | undefined;
        const isSuspended = c.get('isSuspended') as boolean | undefined;
        const suspendedUntil = c.get('suspendedUntil') as number | undefined;

        // Banned users cannot perform any action
        if (isBanned) {
            return c.json({
                message: 'Your account has been banned',
                status: 403,
                banned: true
            }, 403);
        }

        // Suspended users cannot create content
        if (isSuspended) {
            const suspendedDate = suspendedUntil 
                ? new Date(suspendedUntil * 1000).toISOString()
                : 'unknown';
            return c.json({
                message: `Your account is suspended until ${suspendedDate}`,
                status: 403,
                suspended: true,
                suspendedUntil: suspendedUntil
            }, 403);
        }

        await next();
    }
);

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
