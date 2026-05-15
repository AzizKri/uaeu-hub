import { apiFetch } from "./client";

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/notification';

async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    return headers;
}

export async function getNotifications(offset: number = 0) {
    const headers = await getAuthHeaders();
    const response = await apiFetch(base + `?offset=${offset}`, { headers });
    return { status: response.status, data: await response.json() };
}

export async function readNotifications() {
    const headers = await getAuthHeaders();
    const response = await apiFetch(base + '/read', {
        method: 'POST',
        headers,
    });
    return { status: response.status };
}
