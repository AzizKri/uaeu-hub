import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/notification';

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

export async function getNotifications(offset: number = 0) {
    const headers = await getAuthHeaders();
    const response = await fetch(base + `?offset=${offset}`, { headers });
    return { status: response.status, data: await response.json() };
}

export async function readNotifications() {
    const headers = await getAuthHeaders();
    const response = await fetch(base + '/read', {
        method: 'POST',
        headers,
    });
    return { status: response.status };
}
