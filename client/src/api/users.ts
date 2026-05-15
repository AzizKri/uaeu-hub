import { apiFetch } from "./client";

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/user';

async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    return headers;
}

// Get user data by username
export async function getUserByUsername(username: string) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `/${username}`, { headers });
    return { status: request.status, data: await request.json() };
}

export async function searchUser(query: string, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `/search?query=${encodeURIComponent(query)}&offset=${offset}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

export async function searchUsersWithStatusInCommunity(query: string, communityId: number, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `/searchWithStatusInCommunity?query=${encodeURIComponent(query)}&communityId=${communityId}&offset=${offset}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

export async function getUserCommunities(userId: string) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `/${userId}/communities`, { headers });
    return { status: request.status, data: await request.json() };
}
