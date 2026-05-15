import { env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const base = 'http://127.0.0.1:8787';
const validAssetId = '123e4567-e89b-12d3-a456-426614174000';

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
    const username = unique('communityuser');
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

describe('Community creation', () => {
    it('rejects community creation when no tags are selected', async () => {
        const formData = new FormData();
        formData.append('name', unique('community'));
        formData.append('desc', 'A community without tags');
        formData.append('tags', '');
        formData.append('icon', validAssetId);

        const response = await SELF.fetch(`${base}/community`, {
            method: 'POST',
            body: formData
        });

        expect(response.status).toBe(400);
        const body = await response.json() as { errors?: Array<{ field?: string; message?: string }> };
        expect(body.errors).toContainEqual({
            field: 'tags',
            message: 'Please select at least one tag'
        });
    });

    it('creates a community with the selected tag', async () => {
        const cookie = await signupUser();
        const name = unique('community');
        const formData = new FormData();
        formData.append('name', name);
        formData.append('desc', 'A community with a selected tag');
        formData.append('tags', 'Study');
        formData.append('icon', validAssetId);

        const response = await SELF.fetch(`${base}/community`, {
            method: 'POST',
            headers: { Cookie: cookie },
            body: formData
        });

        expect(response.status).toBe(201);
        const body = await response.json() as { id: number };
        const community = await env.DB.prepare(`
            SELECT name, tags
            FROM community
            WHERE id = ?
        `).bind(body.id).first<{ name: string; tags: string | null }>();
        expect(community).toEqual({ name, tags: 'Study' });

        const communityTags = await env.DB.prepare(`
            SELECT tag.name
            FROM community_tag
            JOIN tag ON tag.id = community_tag.tag_id
            WHERE community_tag.community_id = ?
        `).bind(body.id).first<{ name: string }>();
        expect(communityTags?.name).toBe('Study');
    });
});
