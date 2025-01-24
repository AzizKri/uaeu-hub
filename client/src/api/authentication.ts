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
