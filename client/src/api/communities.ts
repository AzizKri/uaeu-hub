import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/community';

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

// Create a community
export async function createCommunity(name: string, description: string, tags: string[], icon?: string) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('desc', description);
    formData.append('tags', tags.join(','));

    if (icon) {
        formData.append('icon', icon);
    }

    const headers = await getAuthHeaders(false);
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: formData,
    });
    return request.status;
}

// Check if a community exists with the given name
export async function communityExists(name: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/exists/${name}`, {
        method: 'GET',
        headers,
    });
    const exist = await request.json();
    return exist.exists;
}

// Get community by ID
export async function getCommunityById(id: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${id}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Get community by name
export async function getCommunityByName(name: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/getCommunityByName/${name}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Get communities by tag
export async function getCommunitiesByTag(tag: string, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/getCommunitiesByTag?tag=${tag}&offset=${offset}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Get communities by multiple tags
export async function getCommunitiesByTags(tags: string[]) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/getCommunitiesByTags?tags=${tags.join(',')}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Get communities sorted by latest, activity, or members
export async function getCommunities(sortBy: 'latest' | 'activity' | 'members' = 'members', offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/getCommunities?sortBy=${sortBy}&offset=${offset}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Search communities by query
export async function searchCommunities(query: string, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/searchCommunities?query=${query}&offset=${offset}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Edit community by ID
export async function editCommunity(id: number, name?: string, description?: string, icon?: string, tags?: string[]) {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (description) formData.append('desc', description);
    if (icon) formData.append('icon', icon);
    if (tags) formData.append('tags', tags.join(','));

    const headers = await getAuthHeaders(false);
    const request = await fetch(base + `/${id}`, {
        method: 'POST',
        headers,
        body: formData,
    });
    return request.status;
}

// Delete community by ID
export async function deleteCommunity(id: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${id}`, {
        method: 'DELETE',
        headers,
    });
    return request.status;
}

// Join community by ID
export async function joinCommunity(id: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/join/${id}`, {
        method: 'POST',
        headers,
    });
    return request.status;
}

// Leave community by ID
export async function leaveCommunity(id: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/leave/${id}`, {
        method: 'POST',
        headers,
    });
    return request.status;
}

// Get members of community by ID
export async function getMembersOfCommunity(id: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/getMembers/${id}`, {
        method: 'GET',
        headers,
    });
    return { status: request.status, data: await request.json() };
}

// Invite user to community
export async function inviteUserToCommunity(communityId: number, userId: number) {
    const formData = new FormData();
    formData.append('communityId', communityId.toString());
    formData.append('userId', userId.toString());

    const headers = await getAuthHeaders(false);
    const request = await fetch(base + `/invite`, {
        method: 'POST',
        headers,
        body: formData,
    });
    return request.status;
}

// Remove member from community
export async function removeMemberFromCommunity(id: number, userId: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/removeMember/${id}/${userId}`, {
        method: 'DELETE',
        headers,
    });
    return request.status;
}

// Add admin to community
export async function addAdminToCommunity(userId: number, communityId: number) {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('communityId', communityId.toString());

    const headers = await getAuthHeaders(false);
    const request = await fetch(base + `/addAdmin`, {
        method: 'POST',
        headers,
        body: formData,
    });
    return request.status;
}

// Get latest community posts
export async function getLatestCommunityPosts(id: number, offset: number = 0) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/posts/${id}?offset=${offset}`, {
        method: 'GET',
        headers,
    });

    return { status: request.status, data: await request.json() };
}

// Reject invitation by ID
export async function rejectInvitation(id: number) {
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/rejectInvitation/${id}`, {
        method: 'POST',
        headers,
    });
    return request.status;
}
