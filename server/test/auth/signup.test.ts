import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const base = 'http://127.0.0.1:8787';

describe('Auth utilities', () => {
    it('reports username availability for valid usernames', async () => {
        const response = await SELF.fetch(`${base}/auth/check-username?username=user1`);

        expect(response.status).toBe(200);
        const data = await response.json() as { available: boolean };
        expect(data.available).toBe(true);
    });

    it('rejects invalid usernames', async () => {
        const response = await SELF.fetch(`${base}/auth/check-username?username=??`);

        expect(response.status).toBe(400);
        const data = await response.json() as { message: string };
        expect(data.message).toContain('Username');
    });

    it('rejects invalid admin email checks', async () => {
        const response = await SELF.fetch(`${base}/auth/check-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'invalid-email' })
        });

        expect(response.status).toBe(400);
        const data = await response.json() as { errors: Array<{ field: string; message: string }> };
        expect(data.errors.some((error) => error.field === 'email')).toBe(true);
    });

    it('returns false for non-admin emails that are not in the system', async () => {
        const response = await SELF.fetch(`${base}/auth/check-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'missing@example.com' })
        });

        expect(response.status).toBe(200);
        const data = await response.json() as { isAdmin: boolean };
        expect(data.isAdmin).toBe(false);
    });

    it('rejects invalid register payloads before auth runs', async () => {
        const response = await SELF.fetch(`${base}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: '??' })
        });

        expect(response.status).toBe(400);
        const data = await response.json() as { errors: Array<{ field: string; message: string }> };
        expect(data.errors.some((error) => error.field === 'username')).toBe(true);
    });
});
