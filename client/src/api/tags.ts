import { apiFetch } from "./client";
const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/tags';

// Get All Tags
export async function getTags() {
    const request = await apiFetch(base, {
        method: 'GET'
    });
    return { status: request.status, data: await request.json() };
}

