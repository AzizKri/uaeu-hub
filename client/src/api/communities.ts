const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/community';

// Create a community
export async function createCommunity(name: string, description: string, tags: string[], icon?: string) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('desc', description);
    formData.append('tags', tags.join(','));

    if (icon) {
        formData.append('icon', icon);
    }

    const request = await fetch(base, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}

// Check if a community exists with the given name
export async function communityExists(name: string) {
    const request = await fetch(base + `/exists/${name}`, {
        method: 'GET',
        credentials: 'include'
    });
    const exist = await request.json();
    return exist.exists;
}

// Get community by ID
export async function getCommunityById(id: number) {
    const request = await fetch(base + `/${id}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Get community by name
export async function getCommunityByName(name: string) {
    const request = await fetch(base + `/getCommunityByName/${name}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Get communities by tag
export async function getCommunitiesByTag(tag: string, offset: number = 0) {
    const request = await fetch(base + `/getCommunitiesByTag?tag=${tag}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Get communities by multiple tags
export async function getCommunitiesByTags(tags: string[]) {
    const request = await fetch(base + `/getCommunitiesByTags?tags=${tags.join(',')}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Get communities sorted by latest, activity, or members
export async function getCommunities(sortBy: 'latest' | 'activity' | 'members' = 'members', offset: number = 0) {
    const request = await fetch(base + `/getCommunities?sortBy=${sortBy}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Search communities by query
export async function searchCommunities(query: string, offset: number = 0) {
    const request = await fetch(base + `/searchCommunities?query=${query}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include'
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

    const request = await fetch(base + `/${id}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}

// Delete community by ID
export async function deleteCommunity(id: number) {
    const request = await fetch(base + `/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

// Join community by ID
export async function joinCommunity(id: number) {
    const request = await fetch(base + `/join/${id}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Leave community by ID
export async function leaveCommunity(id: number) {
    const request = await fetch(base + `/leave/${id}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Get members of community by ID
export async function getMembersOfCommunity(id: number) {
    const request = await fetch(base + `/getMembers/${id}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Invite user to community
export async function inviteUserToCommunity(communityId: number, userId: number) {
    const formData = new FormData();
    formData.append('communityId', communityId.toString());
    formData.append('userId', userId.toString());

    const request = await fetch(base + `/invite`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
    return request.status;
}

// Remove member from community
export async function removeMemberFromCommunity(id: number, userId: number) {
    const request = await fetch(base + `/removeMember/${id}/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

// Add admin to community
export async function addAdminToCommunity(userId: number, communityId: number) {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('communityId', communityId.toString());

    const request = await fetch(base + `/addAdmin`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
    return request.status;
}

// Get latest community posts
export async function getLatestCommunityPosts(id: number, offset: number = 0) {
    const request = await fetch(base + `/posts/${id}?offset=${offset}`, {
        method: 'GET',
        credentials: 'include'
    })

    return {status: request.status, data: await request.json() };
}

// Join community by ID
export async function rejectInvitation(id: number) {
    const request = await fetch(base + `/rejectInvitation/${id}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}
