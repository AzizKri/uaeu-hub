const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/user';

// Get user data by username
export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/${username}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

export async function searchUser(query: string, page: number = 0) {
    const request = await fetch(base + `/search?query=${query}&page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

export async function getUserCommunities(userId: number) {
    const request = await fetch(base + `/${userId}/communities`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}
