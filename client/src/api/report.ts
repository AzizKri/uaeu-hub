import { apiFetch } from "./client";
import { ApiMutationResult, toApiMutationResult } from "./errors";

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/report';

async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    return headers;
}

async function submitReport(body: {
    entityId: number | string;
    entityType: 'post' | 'comment' | 'subcomment' | 'community' | 'user';
    reportType: string;
    reason: string;
}): Promise<ApiMutationResult> {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    return toApiMutationResult(
        request,
        `Could not submit ${body.entityType === 'subcomment' ? 'reply' : body.entityType} report.`,
    );
}

export async function reportPost(postId: number, reportType: string, reason: string) {
    return submitReport({ entityId: postId, entityType: 'post', reportType, reason });
}

export async function reportComment(commentId: number, reportType: string, reason: string) {
    return submitReport({ entityId: commentId, entityType: 'comment', reportType, reason });
}

export async function reportSubcomment(subcommentId: number, reportType: string, reason: string) {
    return submitReport({ entityId: subcommentId, entityType: 'subcomment', reportType, reason });
}

export async function reportUser(userId: string, reportType: string, reason: string) {
    return submitReport({ entityId: userId, entityType: 'user', reportType, reason });
}

export async function reportCommunity(communityId: number, reportType: string, reason: string) {
    return submitReport({ entityId: communityId, entityType: 'community', reportType, reason });
}

export async function getReport(reportId: number) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `/${reportId}`, { headers });
    return await request.json();
}

export async function getReportsForCommunity(communityId: number, includeResolved: boolean = false, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `/community/${communityId}?includeResolved=${includeResolved}&offset=${offset}`, {
        headers,
    });
    return await request.json();
}

export async function getAllReports(includeResolved: boolean = false, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `?includeResolved=${includeResolved}&offset=${offset}`, {
        headers,
    });
    return await request.json();
}

export async function resolveReport(reportId: number, communityId: string) {
    const headers = await getAuthHeaders();
    const request = await apiFetch(base + `/resolve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reportId, communityId }),
    });
    return request.status;
}
