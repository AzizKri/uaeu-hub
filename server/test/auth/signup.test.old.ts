import { SELF } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

const base = 'http://127.0.0.1:8787/auth/signup';

describe('Signup', () => {
    beforeAll(async () => {
        const formData = {
            username: 'aziz',
            password: 'StrongPassword-123',
            email: 'aziz@gmail.com'
        };
        await SELF.fetch(base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    });

    it('should successfully create a user', async () => {
        const formData = {
            username: Date.now().toString(),
            password: 'StrongPassword-123',
            email: 'test@example.com'
        };

        const res = await SELF.fetch(base, {
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

    it('should fail to create a user with an existing username', async () => {
        const formData = {
            username: 'aziz',
            password: 'StrongPassword-123',
            email: 'test@example.com'
        };

        const res = await SELF.fetch(base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        expect(res.status).toBe(409);
        const responseBody: { message: string } = await res.json();
        expect(responseBody.message).toBe('User already exists');
    });

    it('should fail to create a user with a reserved username', async () => {
        const formData = {
            username: 'test',
            password: 'StrongPassword-123',
            email: 'test@example.com'
        };

        const res = await SELF.fetch(base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        expect(res.status).toBe(400);
        const responseBody: { message: string } = await res.json();
        expect(responseBody.message).toBe('Username is reserved');
    });

    it('should fail to create a user with invalid data', async () => {
        const formData = {
            username: 't',
            password: 'pass',
            email: 'test.com'
        };

        const res = await SELF.fetch(base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        expect(res.status).toBe(400);

        const responseBody = await res.json();
        expect(responseBody).toMatchObject({
            errors: expect.arrayContaining([expect.objectContaining({ field: expect.any(String), message: expect.any(String) })])
        });
    });

    it('should fail to create a user with includeAnon and without session key', async () => {
        const formData = {
            username: Date.now().toString(),
            password: 'StrongPassword-123',
            email: 'test@example.com',
            includeAnon: true
        };

        const res = await SELF.fetch(base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        expect(res.status).toBe(400);
        const responseBody: { message: string } = await res.json();
        expect(responseBody.message).toBe('No activity found');
    });

    it('should fail to create a us')
});
