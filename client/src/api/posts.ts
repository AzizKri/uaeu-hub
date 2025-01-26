const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/post';

// Create post
export async function createPost(content: string, attachment?: string, communityId: number = 0,) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('communityId', communityId.toString());

    if (attachment) {
        formData.append('filename', attachment);
    }

    const request = await fetch(base, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.json();
}

// Get latest posts
export async function getLatestPosts(offset: number = 0) {
    const request = await fetch(base + `/latest?offset=${offset}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get best posts
export async function getBestPosts(offset: number = 0) {
    const request = await fetch(base + `/best?offset=${offset}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get latest posts from subscribed communities
export async function getLatestPostsFromMyCommunities(offset: number = 0) {
    const request = await fetch(base + `/myLatest?offset=${offset}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get best posts from subscribed communities
export async function getBestPostsFromMyCommunities(offset: number = 0) {
    const request = await fetch(base + `/myBest?offset=${offset}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Search post by query
export async function searchPosts(query: string) {
    const request = await fetch(base + `/search?query=${query}`, { credentials: 'include' });
    if (request.status === 400) {
        return { results: [] };
    }
    return { status: request.status, data: await request.json() };
}

// Get post by ID
export async function getPostByID(id: number) {
    const request = await fetch(base + `/${id}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get posts sent by user (username)
export async function getPostsByUser(username: string, offset: number = 0) {
    const request = await fetch(base + `/user/${username}?offset=${offset}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Toggle like on post by its ID
export async function togglePostLike(post: number) {
    const request = await fetch(base + `/like/${post}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Delete post by its ID
export async function deletePost(post: number) {
    const request = await fetch(base + `/${post}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

