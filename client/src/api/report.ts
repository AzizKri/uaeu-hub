import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/report';

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

export async function reportPost(postId: number, reportType: string, reason: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entityId: postId, entityType: 'post', reportType, reason }),
    });
    return request.status;
}

export async function reportComment(commentId: number, reportType: string, reason: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entityId: commentId, entityType: 'comment', reportType, reason }),
    });
    return request.status;
}

export async function reportSubcomment(subcommentId: number, reportType: string, reason: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entityId: subcommentId, entityType: 'subcomment', reportType, reason }),
    });
    return request.status;
}

export async function reportUser(userId: number, reportType: string, reason: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entityId: userId, entityType: 'user', reportType, reason }),
    });
    return request.status;
}

export async function reportCommunity(communityId: number, reportType: string, reason: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entityId: communityId, entityType: 'community', reportType, reason }),
    });
    return request.status;
}

export async function getReport(reportId: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${reportId}`, { headers });
    return await request.json();
}

export async function getReportsForCommunity(communityId: number, includeResolved: boolean = false, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/community/${communityId}?includeResolved=${includeResolved}&offset=${offset}`, {
        headers,
    });
    return await request.json();
}

export async function getAllReports(includeResolved: boolean = false, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `?includeResolved=${includeResolved}&offset=${offset}`, {
        headers,
    });
    return await request.json();
}

export async function resolveReport(reportId: number, communityId: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/resolve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reportId, communityId }),
    });
    return request.status;
}
