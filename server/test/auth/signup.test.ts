import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const base = 'http://127.0.0.1:8787';

interface SignupResponse {
    message: string;
    userId?: string;
    error?: string;
}

describe('Auth - Signup', () => {
    const validUser = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'user1',
        displayname: 'displayname'
    };

    // Happy path test
    it('should successfully create a new user', async () => {
        const response = await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(validUser)
        });

        expect(response.status).toBe(201);
        const data = await response.json() as SignupResponse;
        expect(data).toHaveProperty('message');
        expect(data).toHaveProperty('userId');
        expect(data.message).toBe('User created successfully');
    });

    // Validation tests
    it('should return 400 for invalid email format', async () => {
        const invalidUser = {
            ...validUser,
            email: 'invalid-email'
        };

        const response = await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invalidUser)
        });

        expect(response.status).toBe(400);
        const data = await response.json() as SignupResponse;
        expect(data).toHaveProperty('error');
        expect(data.error).toContain('email');
    });

    it('should return 400 for weak password', async () => {
        const weakPasswordUser = {
            ...validUser,
            password: '123'
        };

        const response = await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(weakPasswordUser)
        });

        expect(response.status).toBe(400);
        const data = await response.json() as SignupResponse;
        expect(data).toHaveProperty('error');
        expect(data.error).toContain('password');
    });

    it('should return 400 for missing required fields', async () => {
        const incompleteUser = {
            email: 'test@example.com'
        };

        const response = await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incompleteUser)
        });

        expect(response.status).toBe(400);
        const data = await response.json() as SignupResponse;
        expect(data).toHaveProperty('error');
    });

    it('should return 409 for duplicate email', async () => {
        // First signup
        await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(validUser)
        });

        // Second signup with same email
        const response = await SELF.fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(validUser)
        });

        expect(response.status).toBe(409);
        const data = await response.json() as SignupResponse;
        expect(data).toHaveProperty('error');
        expect(data.error).toContain('already exists');
    });
});
