const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/auth';

// TODO - Create a websocket connection on login or signup

export async function me() {
    console.log("me");
    const request = await fetch(base + `/me`, { credentials: 'include' });
    const data = await request.json();
    return data.user;
}

export async function signUp(formData: { displayname: string, email: string, username: string, password: string }) {
    return await fetch(base + `/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
}

export async function login(formData: { identifier: string, password: string }) {
    return await fetch(base + `/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
}

export async function logout() {
    const data = await fetch(base + `/logout`, { credentials: 'include' });
    return data.status;
}

export async function signInWithGoogle(code: string) {
    const res = await fetch(base + `/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include'
    });

    return { status: res.status, data: await res.json() };
}

export async function sendEmailVerification() {
    return await fetch(base + `/sendEmailVerification`, { credentials: 'include' });
}

export async function verifyEmail(token: string) {
    return await fetch(base + `/verifyEmail?token=${token}`);
}

export async function sendForgotPasswordEmail(email: string) {
    return await fetch(base + `/forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
}

export async function resetPassword(token: string, password: string) {
    return await fetch(base + `/resetPassword?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
    });
}

export async function changePassword(currentPassword: string, newPassword: string) {
    return await fetch(base + `/changePassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include'
    });
}
