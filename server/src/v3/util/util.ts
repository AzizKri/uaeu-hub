import { Context } from 'hono';
import { hashSessionKey } from './crypto';
import { anonSignup } from '../controllers/user.controller';

export async function getUserFromSessionKey(c: Context, sessionKey: string) {
    const env: Env = c.env;
    const hashedKey = await hashSessionKey(sessionKey);

    try {
        let userResult = await env.DB.prepare(
            `SELECT user_id FROM session WHERE id = ?`
        ).bind(hashedKey).first<SessionRow>();

        if (!userResult) {
            await anonSignup(c);

            const newHashedKey = await hashSessionKey(c.get('sessionKey'));

            userResult = await env.DB.prepare(
                `SELECT user_id FROM session WHERE id = ?`
            ).bind(newHashedKey).first<SessionRow>();

            return userResult?.user_id;
        }
        return userResult?.user_id;
    } catch (e) {
        console.log(e);
        return null;
    }
}
