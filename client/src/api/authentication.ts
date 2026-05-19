import { apiFetch, jsonHeaders } from './client';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/auth';

export interface AuthUser {
    id: string;
    public_id?: string;
    username: string;
    displayname?: string | null;
    email?: string | null;
    email_verified?: boolean;
    bio?: string | null;
    pfp?: string | null;
    is_anonymous?: boolean | number;
    is_admin?: boolean | number;
    suspended_until?: number | null;
    is_banned?: boolean | number;
}

export async function me(): Promise<AuthUser | null> {
    const request = await apiFetch(base + '/me');
    const data = await request.json();
    return data.user ?? null;
}

export async function checkUsername(username: string): Promise<{ available: boolean; message?: string }> {
    const response = await apiFetch(base + `/check-username?username=${encodeURIComponent(username)}`);
    return await response.json();
}

export async function signup(data: {
    username: string;
    displayname: string;
    email: string;
    password: string;
    includeAnon?: boolean;
}): Promise<Response> {
    return await apiFetch(base + '/signup', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(data),
    });
}

export async function login(identifier: string, password: string): Promise<Response> {
    return await apiFetch(base + '/login', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ identifier, password }),
    });
}

export async function logout(): Promise<number> {
    const response = await apiFetch(base + '/logout', { method: 'POST' });
    return response.status;
}

export async function isAnon(): Promise<boolean> {
    const response = await apiFetch(base + '/isAnon');
    const data = await response.json();
    return data.anon === true;
}

export async function isUser(): Promise<boolean> {
    const response = await apiFetch(base + '/isUser');
    const data = await response.json();
    return data.user === true;
}

export async function sendEmailVerification(): Promise<Response> {
    return await apiFetch(base + '/sendEmailVerification', { method: 'POST' });
}

export async function sendForgotPasswordEmail(email: string): Promise<Response> {
    return await apiFetch(base + '/forgotPassword', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email }),
    });
}

export async function resetPassword(token: string, password: string): Promise<Response> {
    return await apiFetch(base + `/resetPassword?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ newPassword: password }),
    });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<Response> {
    return await apiFetch(base + '/changePassword', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export async function changeEmail(email: string, password: string): Promise<Response> {
    return await apiFetch(base + '/changeEmail', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email, password }),
    });
}
