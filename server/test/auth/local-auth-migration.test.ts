import { env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { hashPassword } from '../../src/v3/util/crypto';

const base = 'http://127.0.0.1:8787';
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CookieHeaders = Headers & { getSetCookie?: () => string[] };

function cookieHeaderFrom(response: Response): string {
    const headers = response.headers as CookieHeaders;
    const setCookies = headers.getSetCookie?.() ?? (headers.get('set-cookie') ? [headers.get('set-cookie')!] : []);
    return setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
}

function unique(prefix: string) {
    return `${prefix.slice(0, 8)}${Math.random().toString(36).slice(2, 8)}`;
}

function saltFromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

async function signupUser(overrides: Partial<{
    username: string;
    displayname: string;
    email: string;
    password: string;
    includeAnon: boolean;
}> = {}) {
    const username = overrides.username ?? unique('localuser');
    const password = overrides.password ?? 'StrongPassword-123';
    const payload = {
        username,
        displayname: overrides.displayname ?? username,
        email: overrides.email ?? `${username}@example.com`,
        password,
        includeAnon: overrides.includeAnon ?? false
    };

    const response = await SELF.fetch(`${base}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    return { response, payload, cookie: cookieHeaderFrom(response) };
}

describe('Local cookie auth migration', () => {
    it('does not create an anonymous user while checking the current user', async () => {
        const before = await env.DB.prepare(`
            SELECT COUNT(*) AS count FROM user WHERE is_anonymous = 1
        `).first<{ count: number }>();

        const response = await SELF.fetch(`${base}/auth/me`);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ user: null });

        const after = await env.DB.prepare(`
            SELECT COUNT(*) AS count FROM user WHERE is_anonymous = 1
        `).first<{ count: number }>();
        expect(after?.count).toBe(before?.count);
    });

    it('creates a local account, returns backend user data, and sets session cookies', async () => {
        const { response, payload, cookie } = await signupUser();

        expect(response.status).toBe(201);
        expect(cookie).toContain('sessionKey=');
        expect(cookie).toContain('sessionToken=');

        const body = await response.json() as { user: { id: string; username: string; email: string; is_anonymous: boolean } };
        expect(body.user).toMatchObject({
            id: expect.stringMatching(uuidRegex),
            username: payload.username,
            email: payload.email,
            is_anonymous: false
        });

        const row = await env.DB.prepare(`
            SELECT id, password, salt FROM user WHERE email = ?
        `).bind(payload.email).first<{ id: string; password: string; salt: string }>();
        expect(row?.id).toMatch(uuidRegex);
        const unpepperedHash = await hashPassword(payload.password, saltFromBase64(row!.salt));
        expect(row?.password).not.toBe(unpepperedHash);

        const me = await SELF.fetch(`${base}/auth/me`, {
            headers: { Cookie: cookie }
        });
        await expect(me.json()).resolves.toMatchObject({
            user: {
                id: body.user.id,
                username: payload.username,
                is_anonymous: false
            }
        });
    });

    it('logs in with username or email and rejects banned users', async () => {
        const { payload } = await signupUser();

        const byUsername = await SELF.fetch(`${base}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: payload.username, password: payload.password })
        });
        expect(byUsername.status).toBe(200);
        expect(cookieHeaderFrom(byUsername)).toContain('sessionKey=');

        const byEmail = await SELF.fetch(`${base}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: payload.email, password: payload.password })
        });
        expect(byEmail.status).toBe(200);

        await env.DB.prepare(`UPDATE user SET is_banned = 1 WHERE email = ?`).bind(payload.email).run();

        const banned = await SELF.fetch(`${base}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: payload.email, password: payload.password })
        });
        expect(banned.status).toBe(403);
        await expect(banned.json()).resolves.toMatchObject({ banned: true });
    });

    it('creates an anonymous session only after a valid first write and upgrades that row on signup', async () => {
        const postForm = new FormData();
        postForm.append('content', 'Anonymous migration post');

        const postResponse = await SELF.fetch(`${base}/post`, {
            method: 'POST',
            body: postForm
        });
        expect(postResponse.status).toBe(201);

        const anonCookie = cookieHeaderFrom(postResponse);
        expect(anonCookie).toContain('sessionKey=');

        const post = await postResponse.json() as { id: number; author_id: string; author: string };
        expect(post.author).toBe('Anonymous');

        const anonUser = await env.DB.prepare(`
            SELECT id, is_anonymous FROM user WHERE id = ?
        `).bind(post.author_id).first<{ id: string; is_anonymous: number }>();
        expect(anonUser).toMatchObject({ id: post.author_id, is_anonymous: 1 });

        const username = unique('upgraded');
        const signupResponse = await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: anonCookie
            },
            body: JSON.stringify({
                username,
                displayname: username,
                email: `${username}@example.com`,
                password: 'StrongPassword-123',
                includeAnon: true
            })
        });
        expect(signupResponse.status).toBe(200);

        const upgraded = await signupResponse.json() as { user: { id: string; username: string; is_anonymous: boolean } };
        expect(upgraded.user).toMatchObject({ id: post.author_id, username, is_anonymous: false });

        const postAfterUpgrade = await env.DB.prepare(`
            SELECT author_id FROM post WHERE id = ?
        `).bind(post.id).first<{ author_id: string }>();
        expect(postAfterUpgrade?.author_id).toBe(post.author_id);

        const session = await env.DB.prepare(`
            SELECT is_anonymous FROM session WHERE user_id = ?
        `).bind(post.author_id).first<{ is_anonymous: number }>();
        expect(session?.is_anonymous).toBe(0);
    });

    it('keeps existing anonymous content anonymous when signup excludes anonymous data', async () => {
        const postForm = new FormData();
        postForm.append('content', 'Do not transfer this post');

        const postResponse = await SELF.fetch(`${base}/post`, {
            method: 'POST',
            body: postForm
        });
        expect(postResponse.status).toBe(201);

        const anonCookie = cookieHeaderFrom(postResponse);
        const post = await postResponse.json() as { author_id: string };
        const username = unique('freshuser');

        const signupResponse = await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: anonCookie
            },
            body: JSON.stringify({
                username,
                displayname: username,
                email: `${username}@example.com`,
                password: 'StrongPassword-123',
                includeAnon: false
            })
        });
        expect(signupResponse.status).toBe(201);

        const user = await signupResponse.json() as { user: { id: string; is_anonymous: boolean } };
        expect(user.user.id).not.toBe(post.author_id);
        expect(user.user.is_anonymous).toBe(false);

        const originalAuthor = await env.DB.prepare(`
            SELECT is_anonymous FROM user WHERE id = ?
        `).bind(post.author_id).first<{ is_anonymous: number }>();
        expect(originalAuthor?.is_anonymous).toBe(1);
    });

    it('keeps anonymous likes disabled', async () => {
        const { response, cookie } = await signupUser();
        const user = await response.json() as { user: { id: string } };

        const post = await env.DB.prepare(`
            INSERT INTO post (author_id, content, public_id)
            VALUES (?, 'Like target', ?)
            RETURNING id
        `).bind(user.user.id, unique('post')).first<{ id: number }>();

        const anonForm = new FormData();
        anonForm.append('content', 'Anonymous author');
        const anonPost = await SELF.fetch(`${base}/post`, { method: 'POST', body: anonForm });
        const anonCookie = cookieHeaderFrom(anonPost);

        const like = await SELF.fetch(`${base}/post/like/${post?.id}`, {
            method: 'POST',
            headers: { Cookie: anonCookie }
        });
        expect(like.status).toBe(400);

        const registeredLike = await SELF.fetch(`${base}/post/like/${post?.id}`, {
            method: 'POST',
            headers: { Cookie: cookie }
        });
        expect(registeredLike.status).toBe(200);
    });

    it('verifies email with backend tokens', async () => {
        const { response, payload } = await signupUser();
        expect(response.status).toBe(201);

        const token = await env.DB.prepare(`
            SELECT ev.token
            FROM email_verification ev
            JOIN user u ON u.id = ev.user_id
            WHERE u.email = ?
        `).bind(payload.email).first<{ token: string }>();
        expect(token?.token).toBeTruthy();

        const verify = await SELF.fetch(`${base}/auth/verifyEmail?token=${token?.token}`);
        expect(verify.status).toBe(200);

        const user = await env.DB.prepare(`
            SELECT email_verified FROM user WHERE email = ?
        `).bind(payload.email).first<{ email_verified: number }>();
        expect(user?.email_verified).toBe(1);
    });

    it('resets passwords with backend tokens and revokes old sessions', async () => {
        const { response, payload, cookie } = await signupUser();
        expect(response.status).toBe(201);

        const forgot = await SELF.fetch(`${base}/auth/forgotPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: payload.email })
        });
        expect(forgot.status).toBe(200);

        const token = await env.DB.prepare(`
            SELECT pr.token
            FROM password_reset pr
            JOIN user u ON u.id = pr.user_id
            WHERE u.email = ? AND pr.used = 0
        `).bind(payload.email).first<{ token: string }>();
        expect(token?.token).toBeTruthy();

        const reset = await SELF.fetch(`${base}/auth/resetPassword?token=${token?.token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: 'NewStrongPassword-123' })
        });
        expect(reset.status).toBe(200);

        const oldMe = await SELF.fetch(`${base}/auth/me`, {
            headers: { Cookie: cookie }
        });
        await expect(oldMe.json()).resolves.toMatchObject({ user: null });

        const oldLogin = await SELF.fetch(`${base}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: payload.email, password: payload.password })
        });
        expect(oldLogin.status).toBe(401);

        const newLogin = await SELF.fetch(`${base}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: payload.email, password: 'NewStrongPassword-123' })
        });
        expect(newLogin.status).toBe(200);
    });
});
