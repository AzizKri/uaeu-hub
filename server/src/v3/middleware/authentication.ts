import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { createAnonymousSession, resolveSession } from '../util/session';

async function applyResolvedSession(c: Context, createAnonymous: boolean): Promise<void> {
    let session = await resolveSession(c);

    if (!session && createAnonymous) {
        session = await createAnonymousSession(c);
    }

    if (!session) return;

    c.set('userId', session.userId);
    c.set('isAnonymous', session.isAnonymous);
}

/**
 * Sets `{ userId, isAnonymous }` only when a valid D1 session cookie exists.
 */
export const authMiddlewareCheckOnly = createMiddleware(
    async (c: Context, next) => {
        await applyResolvedSession(c, false);
        await next();
    }
);

/**
 * Sets `{ userId, isAnonymous }`; creates a durable anonymous session when no valid session exists.
 */
export const authMiddleware = createMiddleware(
    async (c: Context, next) => {
        await applyResolvedSession(c, true);
        await next();
    }
);
