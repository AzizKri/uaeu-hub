import {base} from "./api.ts";

// Create a community
export async function createCommunity(name: string, description: string, tags: string[], icon?: string) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('desc', description);
    formData.append('tags', tags.join(','));

    if (icon) {
        formData.append('icon', icon);
    }

    const request = await fetch(base + `/community`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}

// Check if a community exists with the given name
export async function communityExists(name: string) {
    const request = await fetch(base + `/community/exists/${name}`, {
        method: 'GET',
        credentials: 'include'
    });
    const exist = await request.json();
    return exist.exists;
}

// Get community by ID
export async function getCommunityById(id: number) {
    const request = await fetch(base + `/community/${id}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Get community by name
export async function getCommunityByName(name: string) {
    const request = await fetch(base + `/community/getCommunityByName/${name}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Get communities by tag
export async function getCommunitiesByTag(tag: string, page: number = 0) {
    const request = await fetch(base + `/community/getCommunitiesByTag?tag=${tag}&page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Get communities sorted by latest, activity, or members
export async function getCommunities(sortBy: 'latest' | 'activity' | 'members' = 'members', page: number = 0) {
    const request = await fetch(base + `/community/getCommunities?sortBy=${sortBy}&page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Search communities by query
export async function searchCommunities(query: string, page: number = 0) {
    const request = await fetch(base + `/community/searchCommunities?query=${query}&page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Edit community by ID
export async function editCommunity(id: number, name?: string, description?: string, icon?: string, tags?: string[]) {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    if (icon) formData.append('icon', icon);
    if (tags) formData.append('tags', tags.join(','));

    const request = await fetch(base + `/community/${id}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}

// Delete community by ID
export async function deleteCommunity(id: number) {
    const request = await fetch(base + `/community/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

// Join community by ID
export async function joinCommunity(id: number) {
    const request = await fetch(base + `/community/join/${id}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Leave community by ID
export async function leaveCommunity(id: number) {
    const request = await fetch(base + `/community/leave/${id}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Get members of community by ID
export async function getMembersOfCommunity(id: number) {
    const request = await fetch(base + `/community/getMembers/${id}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// TODO - Redo into inviteMemberToCommunity
// Add member to community
export async function addMemberToCommunity(id: number, userId: number) {
    const request = await fetch(base + `/community/addMember/${id}/${userId}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Remove member from community
export async function removeMemberFromCommunity(id: number, userId: number) {
    const request = await fetch(base + `/community/removeMember/${id}/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

