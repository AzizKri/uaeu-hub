import { Context } from 'hono';
import { hashSessionKey } from './crypto';
import { anonSignup } from '../controllers/user.controller';

export async function getUserFromSessionKey(c: Context, sessionKey: string | false | undefined) {
    const env: Env = c.env;

    if (!sessionKey) {
        return await signupAnon(c);
    }
    const hashedKey = await hashSessionKey(sessionKey);

    try {
        let userResult = await env.DB.prepare(
            `SELECT user_id FROM session WHERE id = ?`
        ).bind(hashedKey).first<SessionRow>();

        if (!userResult) {
            return await signupAnon(c);
        }
        return userResult?.user_id;
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function signupAnon(c: Context) {
    const env: Env = c.env;
    await anonSignup(c);

    const newHashedKey = await hashSessionKey(c.get('sessionKey'));

    const userResult = await env.DB.prepare(
        `SELECT user_id FROM session WHERE id = ?`
    ).bind(newHashedKey).first<SessionRow>();

    return userResult?.user_id;
}
