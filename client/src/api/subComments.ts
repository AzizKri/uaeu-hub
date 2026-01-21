import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/subcomment';

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

// SubComment on comment
export async function subComment(comment: number, content: string, attachment?: string) {
    const formData = new FormData();
    formData.append('commentId', comment.toString());
    formData.append('content', content);

    if (attachment) {
        formData.append('filename', attachment);
    }

    const headers = await getAuthHeaders(false);
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: formData,
    });
    return { status: request.status, data: await request.json() };
}

// Get subComments on a comment by its ID
export async function getSubCommentsOnComment(comment: number, page: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${comment}?page=${page}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Like/unlike a subComment by its ID
export async function likeSubComment(subComment: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/like/${subComment}`, {
        method: 'POST',
        headers,
    });
    return request.status;
}

// Delete subComment by its ID
// Optional reason for admin deletions
export async function deleteSubComment(subComment: number, reason?: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${subComment}`, {
        method: 'DELETE',
        headers,
        body: reason ? JSON.stringify({ reason }) : undefined,
    });
    return request.status;
}
