const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/report';

export async function reportPost(postId: number, reportType: string, reason: string) {
    const request = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: postId, entityType: 'post', reportType, reason }),
        credentials: 'include'
    });
    return request.status;
}

export async function reportComment(commentId: number, reportType: string, reason: string) {
    const request = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: commentId, entityType: 'comment', reportType, reason }),
        credentials: 'include'
    });
    return request.status;
}

export async function reportSubcomment(subcommentId: number, reportType: string, reason: string) {
    const request = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: subcommentId, entityType: 'subcomment', reportType, reason }),
        credentials: 'include'
    });
    return request.status;
}

export async function reportUser(userId: number, reportType: string, reason: string) {
    const request = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: userId, entityType: 'user', reportType, reason }),
        credentials: 'include'
    });
    return request.status;
}

export async function reportCommunity(communityId: number, reportType: string, reason: string) {
    const request = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: communityId, entityType: 'community', reportType, reason }),
        credentials: 'include'
    });
    return request.status;
}

export async function getReport(reportId: number) {
    const request = await fetch(base + `/${reportId}`, {
        credentials: 'include'
    });
    return await request.json();
}

export async function getReportsForCommunity(communityId: number, includeResolved: boolean = false, offset: number = 0) {
    const request = await fetch(base + `/community/${communityId}?includeResolved=${includeResolved}&offset=${offset}`, {
        credentials: 'include'
    });
    return await request.json();
}

export async function getAllReports(includeResolved: boolean = false, offset: number = 0) {
    const request = await fetch(base + `?includeResolved=${includeResolved}&offset=${offset}`, {
        credentials: 'include'
    });
    return await request.json();
}

export async function resolveReport(reportId: number, communityId: string) {
    const request = await fetch(base + `/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, communityId }),
        credentials: 'include'
    });
    return request.status;
}
