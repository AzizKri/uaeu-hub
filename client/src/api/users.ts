import {base} from "./api.ts";

// Get user data by username
export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

export async function searchUser(query: string, page: number = 0) {
    const request = await fetch(base + `/user/search?query=${query}&page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

export async function getUserCommunities(userId: number) {
    const request = await fetch(base + `/user/${userId}/communities`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

export async function editCurrentUser(name?: string, bio?: string, pfp?: string) {
    const formData = new FormData();
    if (name) formData.append('displayname', name);
    if (bio) formData.append('bio', bio);
    if (pfp) formData.append('pfp', pfp);

    const request = await fetch(base + `/user`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}
