import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/comment';

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

// Comment on post
export async function comment(post: number, content: string, attachment?: string) {
    const formData = new FormData();
    formData.append('postId', post.toString());
    formData.append('content', content);

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

// Get comments on a post by its ID
export async function getCommentsOnPost(post: number, offset: number = 0) {
    console.log("getting more comments on posts, offset:", offset);
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${post}?offset=${offset}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Like/unlike a comment by its ID
export async function likeComment(comment: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/like/${comment}`, {
        method: 'POST',
        headers,
    });
    return request.status;
}

// Delete comment by its ID
export async function deleteComment(comment: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${comment}`, {
        method: 'DELETE',
        headers,
    });
    return request.status;
}
