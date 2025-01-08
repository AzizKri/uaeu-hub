import {base} from "./api.ts";

// Create post
export async function createPost(content: string, attachment?: string, communityId: number = 0,) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('communityId', communityId.toString());

    if (attachment) {
        formData.append('filename', attachment);
    }

    const request = await fetch(base + `/post`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.json();
}

// Get latest posts
export async function getLatestPosts(page: number = 0) {
    console.log("getLatestPosts");
    const request = await fetch(base + `/post/latest?page=${page}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get best posts
export async function getBestPosts(page: number = 0) {
    const request = await fetch(base + `/post/best?page=${page}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get latest posts from subscribed communities
export async function getLatestPostsFromMyCommunities(page: number = 0) {
    const request = await fetch(base + `/post/myLatest?page=${page}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get best posts from subscribed communities
export async function getBestPostsFromMyCommunities(page: number = 0) {
    const request = await fetch(base + `/post/myBest?page=${page}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Search post by query
export async function searchPosts(query: string) {
    const request = await fetch(base + `/post/search?query=${query}`, { credentials: 'include' });
    if (request.status === 400) {
        return { results: [] };
    }
    return { status: request.status, data: await request.json() };
}

// Get post by ID
export async function getPostByID(id: number) {
    const request = await fetch(base + `/post/${id}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get posts sent by user (username)
export async function getPostsByUser(username: string, page: number = 0) {
    const request = await fetch(base + `/post/user/${username}?page=${page}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Toggle like on post by its ID
export async function togglePostLike(post: number) {
    const request = await fetch(base + `/post/like/${post}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Delete post by its ID
export async function deletePost(post: number) {
    const request = await fetch(base + `/post/${post}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

