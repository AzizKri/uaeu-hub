import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/user';

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

// Get user data by username
export async function getUserByUsername(username: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${username}`, { headers });
    return { status: request.status, data: await request.json() };
}

export async function searchUser(query: string, page: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/search?query=${query}&page=${page}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

export async function searchUsersWithStatusInCommunity(query: string, communityId: number, page: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/searchWithStatusInCommunity?query=${query}&communityId=${communityId}&page=${page}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

export async function getUserCommunities(userId: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${userId}/communities`, { headers });
    return { status: request.status, data: await request.json() };
}
