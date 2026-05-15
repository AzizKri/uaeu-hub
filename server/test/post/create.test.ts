import { env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const base = 'http://127.0.0.1:8787';

type CookieHeaders = Headers & { getSetCookie?: () => string[] };

function cookieHeaderFrom(response: Response): string {
    const headers = response.headers as CookieHeaders;
    const setCookies = headers.getSetCookie?.() ?? (headers.get('set-cookie') ? [headers.get('set-cookie')!] : []);
    return setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
}

function unique(prefix: string) {
    return `${prefix.slice(0, 8)}${Math.random().toString(36).slice(2, 8)}`;
}

async function signupUser() {
    const username = unique('postuser');
    const response = await SELF.fetch(`${base}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            displayname: username,
            email: `${username}@example.com`,
            password: 'StrongPassword-123',
            includeAnon: false
        })
    });

    expect(response.status).toBe(201);
    return cookieHeaderFrom(response);
}

describe('Post creation', () => {
    it('posts to the general community when no community is selected', async () => {
        const cookie = await signupUser();
        const formData = new FormData();
        formData.append('content', 'Post without explicit community');

        const response = await SELF.fetch(`${base}/post`, {
            method: 'POST',
            headers: { Cookie: cookie },
            body: formData
        });

        expect(response.status).toBe(201);
        const post = await response.json() as { id: number; community_id: number; community: string };
        expect(post.community_id).toBe(0);
        expect(post.community).toBe('general');

        const row = await env.DB.prepare(`
            SELECT community_id
            FROM post
            WHERE id = ?
        `).bind(post.id).first<{ community_id: number }>();
        expect(row?.community_id).toBe(0);
    });
});
