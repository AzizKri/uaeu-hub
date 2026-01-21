import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/post';

/**
 * Helper to get authorization headers with Firebase ID token
 */
async function getAuthHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    const token = await getIdToken();
    const headers: HeadersInit = {};
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Create post
export async function createPost(content: string, attachment?: string, communityId: number = 0,) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('communityId', communityId.toString());

    if (attachment) {
        formData.append('filename', attachment);
    }

    // Don't include Content-Type for FormData - browser sets it with boundary
    const headers = await getAuthHeaders(false);
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: formData,
    });
    return request.json();
}

// Get latest posts
export async function getLatestPosts(offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/latest?offset=${offset}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Get best posts
export async function getBestPosts(offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/best?offset=${offset}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Get latest posts from subscribed communities
export async function getLatestPostsFromMyCommunities(offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/myLatest?offset=${offset}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Get best posts from subscribed communities
export async function getBestPostsFromMyCommunities(offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/myBest?offset=${offset}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Search post by query
export async function searchPosts(query: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/search?query=${encodeURIComponent(query)}`, { headers });
    if (request.status === 400) {
        return { status: 400, data: [] };
    }
    return { status: request.status, data: await request.json() };
}

// Get post by ID (supports both numeric id and public_id)
export async function getPostByID(id: number | string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${id}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Get posts sent by user (username)
export async function getPostsByUser(username: string, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/user/${username}?offset=${offset}`, { headers });
    return { status: request.status, data: await request.json() };
}

// Toggle like on post by its ID (supports both numeric id and public_id)
export async function togglePostLike(post: number | string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/like/${post}`, {
        method: 'POST',
        headers,
    });
    return request.status;
}

// Delete post by its ID (supports both numeric id and public_id)
export async function deletePost(post: number | string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${post}`, {
        method: 'DELETE',
        headers,
    });
    return request.status;
}
