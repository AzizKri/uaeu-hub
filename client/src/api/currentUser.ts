import { getIdToken } from '../firebase/config';

const userBase = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/user';
const authBase = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/auth';

/**
 * Helper to get authorization headers with Firebase ID token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getIdToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// This basically checks if there's a valid Firebase token
export async function isUser() {
    const headers = await getAuthHeaders();
    const request = await fetch(authBase + `/isUser`, { headers });
    return request.status === 200; // true if status is 200, otherwise false (401 Unauthorized or 500 Internal Server Error)
}

// Returns true if anon, false otherwise
export async function isAnon() {
    const headers = await getAuthHeaders();
    const request = await fetch(authBase + `/isAnon`, { headers });
    const data = await request.json();
    return data.anon;
}

// Returns current user data
export async function getCurrentUser() {
    const headers = await getAuthHeaders();
    return await fetch(userBase, { headers });
}

// Returns the like data for the current user
export async function getLikesCurrentUser(type: 'posts' | 'comments' | 'subcomments' = 'posts') {
    const headers = await getAuthHeaders();
    const request = await fetch(userBase + `/likes?type=${type}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Returns the communities the current user is part of
export async function getCommunitiesCurrentUser() {
    const headers = await getAuthHeaders();
    const request = await fetch(userBase + `/communities`, { headers });
    return { status: request.status, data: await request.json() };
}

export async function editCurrentUser({ displayname, bio, pfp }: { displayname?: string, bio?: string, pfp?: string }) {
    const headers = await getAuthHeaders();
    const request = await fetch(userBase, {
        method: 'POST',
        headers,
        body: JSON.stringify({ displayname, bio, pfp }),
    });
    return { status: request.status, data: await request.json() };
}
