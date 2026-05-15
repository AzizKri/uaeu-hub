import { apiFetch } from "./client";
import { isAssetId } from '../utils/tools.ts';

const userBase = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/user';
const authBase = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/auth';

async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    return headers;
}

// Checks if there is a current registered backend session
export async function isUser() {
    const headers = await getAuthHeaders();
    const request = await apiFetch(authBase + `/isUser`, { headers });
    if (request.status !== 200) return false;
    const data = await request.json();
    return data.user === true;
}

// Returns true if anon, false otherwise
export async function isAnon() {
    const headers = await getAuthHeaders();
    const request = await apiFetch(authBase + `/isAnon`, { headers });
    const data = await request.json();
    return data.anon;
}

// Returns current user data
export async function getCurrentUser() {
    const headers = await getAuthHeaders();
    return await apiFetch(userBase, { headers });
}

// Returns the like data for the current user
export async function getLikesCurrentUser(type: 'posts' | 'comments' | 'subcomments' = 'posts') {
    const headers = await getAuthHeaders();
    const request = await apiFetch(userBase + `/likes?type=${type}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Returns the communities the current user is part of
export async function getCommunitiesCurrentUser() {
    const headers = await getAuthHeaders();
    const request = await apiFetch(userBase + `/communities`, { headers });
    return { status: request.status, data: await request.json() };
}

export async function editCurrentUser({ displayname, bio, pfp }: { displayname?: string, bio?: string, pfp?: string }) {
    const headers = await getAuthHeaders();
    const payload: { displayname?: string; bio?: string; pfp?: string } = {};

    if (displayname !== undefined) payload.displayname = displayname;
    if (bio !== undefined) payload.bio = bio;
    if (isAssetId(pfp)) {
        payload.pfp = pfp;
    }

    const request = await apiFetch(userBase, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    return { status: request.status, data: await request.json() };
}
