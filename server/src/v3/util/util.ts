import { Context } from 'hono';
import { hashSessionKey } from './crypto';

export async function getUserFromSessionKey(c: Context, sessionKey: string) {
    const env: Env = c.env;
    const hashedKey = await hashSessionKey(sessionKey);

    const userResult = await env.DB.prepare(
        `SELECT user_id FROM session WHERE id = ?`
    ).bind(hashedKey).first<SessionRow>();

    if (!userResult) return c.text('User not found', { status: 404 });
    return userResult.user_id;
}
