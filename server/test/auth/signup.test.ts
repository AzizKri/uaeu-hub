import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const base = 'http://127.0.0.1:8787';

describe('Signup', () => {
    it('should successfully create a user', async () => {
        const formData = {
            username: Date.now().toString(),
            password: 'StrongPassword-123',
            email: 'test@example.com'
        };

        const res = await SELF.fetch(base + '/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        expect([200, 201]).toContain(res.status);

        const responseBody = await res.json();
        expect(responseBody).toMatchObject({
            id: expect.any(Number),
            username: formData.username,
            displayname: formData.username,
            created_at: expect.any(String),
            is_anonymous: 0
        });
    });
});
