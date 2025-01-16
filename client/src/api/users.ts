import {base} from "./api.ts";

// Get user data by username
export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

export async function getUserCommunities(userId: number) {
    const request = await fetch(base + `/user/${userId}/communities`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}
