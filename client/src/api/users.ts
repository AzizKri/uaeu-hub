import {base} from "./api.ts";

// Get user data by username
export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

