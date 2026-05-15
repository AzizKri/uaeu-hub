import { Context } from 'hono';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { hashSessionKey } from './crypto';
import { createPublicId } from './nanoid';

const SESSION_KEY_MAX_AGE = 360 * 24 * 60 * 60;
const SESSION_TOKEN_MAX_AGE = 30 * 60;

type CookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'None' | 'Strict';
    maxAge: number;
    domain?: string;
}

export type ResolvedSession = {
    sessionId: string;
    sessionKey: string;
    userId: string;
    isAnonymous: boolean;
}

function cookieOptions(c: Context, maxAge: number): CookieOptions {
    const options: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge
    };

    if (c.env.ENVIRONMENT === 'production') {
        options.domain = '.uaeu.chat';
        options.sameSite = 'Strict';
    }

    return options;
}

function randomToken(bytes = 32): string {
    const data = new Uint8Array(bytes);
    crypto.getRandomValues(data);
    return Array.from(data, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function setAuthCookies(c: Context, sessionKey: string, userId: string, isAnonymous: boolean): Promise<void> {
    await setSignedCookie(c, 'sessionKey', sessionKey, c.env.EN_SECRET, cookieOptions(c, SESSION_KEY_MAX_AGE));
    await setSignedCookie(
        c,
        'sessionToken',
        `${userId}:${Number(isAnonymous)}`,
        c.env.EN_SECRET,
        cookieOptions(c, SESSION_TOKEN_MAX_AGE)
    );
}

export async function clearAuthCookies(c: Context): Promise<void> {
    await setSignedCookie(c, 'sessionKey', '', c.env.EN_SECRET, cookieOptions(c, 0));
    await setSignedCookie(c, 'sessionToken', '', c.env.EN_SECRET, cookieOptions(c, 0));
}

export async function createSession(c: Context, userId: string, isAnonymous: boolean): Promise<ResolvedSession> {
    const sessionKey = randomToken();
    const sessionId = await hashSessionKey(sessionKey);
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '';

    await c.env.DB.prepare(`
        INSERT INTO session (id, user_id, is_anonymous, ip)
        VALUES (?, ?, ?, ?)
    `).bind(sessionId, userId, Number(isAnonymous), ip).run();

    await setAuthCookies(c, sessionKey, userId, isAnonymous);

    return { sessionId, sessionKey, userId, isAnonymous };
}

export async function createAnonymousSession(c: Context): Promise<ResolvedSession> {
    const username = `anon_${randomToken(8)}`;
    const id = crypto.randomUUID();
    const publicId = createPublicId();

    const result = await c.env.DB.prepare(`
        INSERT INTO user (id, public_id, username, displayname, is_anonymous)
        VALUES (?, ?, ?, 'Anonymous', 1)
        RETURNING id
    `).bind(id, publicId, username).first<{ id: string }>();

    if (!result) throw new Error('Failed to create anonymous user');

    await addUserToGeneralCommunity(c, result.id);
    return createSession(c, result.id, true);
}

export async function resolveSession(c: Context): Promise<ResolvedSession | null> {
    const sessionKey = await getSignedCookie(c, c.env.EN_SECRET, 'sessionKey') as string | false;
    if (!sessionKey) return null;

    const sessionId = await hashSessionKey(sessionKey);
    const row = await c.env.DB.prepare(`
        SELECT
            session.id,
            session.user_id,
            session.is_anonymous,
            user.is_deleted,
            user.is_banned
        FROM session
        JOIN user ON user.id = session.user_id
        WHERE session.id = ?
    `).bind(sessionId).first<{
        id: string;
        user_id: string;
        is_anonymous: number | boolean;
        is_deleted: number | boolean;
        is_banned: number | boolean;
    }>();

    if (!row || row.is_deleted) return null;

    const isAnonymous = row.is_anonymous === true || row.is_anonymous === 1;
    await setAuthCookies(c, sessionKey, row.user_id, isAnonymous);

    return {
        sessionId: row.id,
        sessionKey,
        userId: row.user_id,
        isAnonymous
    };
}

export async function deleteCurrentSession(c: Context, shouldClearCookies = true): Promise<void> {
    const session = await resolveSession(c);

    if (session) {
        await c.env.DB.prepare('DELETE FROM session WHERE id = ?').bind(session.sessionId).run();
    }

    if (shouldClearCookies) await clearAuthCookies(c);
}

export async function addUserToGeneralCommunity(c: Context, userId: string): Promise<void> {
    await c.env.DB.prepare(`
        INSERT OR IGNORE INTO user_community (user_id, community_id, role_id)
        VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0 LIMIT 1))
    `).bind(userId).run();
}
