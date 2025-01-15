import {base} from './api.ts'

export async function me() {
    console.log("me");
    const request = await fetch(base + `/auth/me`, { credentials: 'include' });
    const data = await request.json();
    return data.user;
}

export async function signUp(formData: { displayname: string, email: string, username: string, password: string }) {
    return await fetch(base + `/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
}

export async function login(formData: { identifier: string, password: string }) {
    return await fetch(base + `/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
}

export async function logout() {
    const data = await fetch(base + `/auth/logout`, { credentials: 'include' });
    return data.status;
}

export async function signInWithGoogle(credential: string) {
    return await fetch(base + `/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
        credentials: 'include'
    });
}
