const base = import.meta.env.VITE_API_URL || 'https://api.uaeu.chat';

/* Authentication */
export async function signUp(formData: { displayname: string, email: string, username: string, password: string }) {
    return await fetch(base + `/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
}

export async function login(formData: { identifier: string, password: string }) {
    return await fetch(base + `/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
}

export async function logout() {
    const data = await fetch(base + `/user/logout`, { credentials: 'include' });
    return data.status;
}

/* Current User */

// This basically checks if there's a session key (Anon or normal user)
export async function isUser() {
    const request = await fetch(base + `/user/isUser`, { credentials: 'include' });
    return request.status === 200; // true if status is 200, otherwise false (401 Unauthorized or 500 Internal Server Error)
}

// Returns true if anon, false otherwise
export async function isAnon() {
    const request = await fetch(base + `/user/isAnon`, { credentials: 'include' });
    const data = await request.json();
    return data.anon;
}

// Returns current user data
export async function getCurrentUser() {
    return await fetch(base + `/user`, { credentials: 'include' });
}

// Returns the like data for the current user
export async function getLikesCurrentUser(type: 'posts' | 'comments' | 'subcomments' = 'posts') {
    const request = await fetch(base + `/user/likes?type=${type}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

/* Users */

// Get user data by username
export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

/* Posts */

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
    const request = await fetch(base + `/post/latest?page=${page}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Get best posts
export async function getBestPosts(page: number = 0) {
    const request = await fetch(base + `/post/best?page=${page}`, { credentials: 'include' });
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
export async function toggleLike(post: number) {
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

/* Attachments */

const allowedMimeTypes = [
    // Images
    'image/jpeg',           // .jpeg, .jpg
    'image/png'            // .png
    // 'image/gif',            // .gif
    // 'image/webp',           // .webp
    // 'image/svg+xml',        // .svg
    // 'image/bmp',            // .bmp
    // 'image/tiff',           // .tiff
    // // Videos
    // 'video/mp4',            // .mp4
    // 'video/quicktime',      // .mov
    // 'video/webm',           // .webm
    // // Audios
    // 'audio/mpeg',           // .mp3
    // 'audio/ogg',            // .ogg
    // 'audio/wav',            // .wav
    // // Documents
    // 'application/pdf',      // .pdf
    // 'application/vnd.ms-powerpoint',    // .ppt
    // 'application/vnd.openxmlformats-officedocument.presentationml.presentation',    // .pptx
    // 'application/msword',   // .doc
    // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // .docx
    // 'application/vnd.ms-excel',    // .xls
    // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',    // .xlsx
];

// Upload attachment
export async function uploadAttachment(attachments: File[]) {
    if (!attachments[0] || !allowedMimeTypes.includes(attachments[0].type)) {
        return { status: 400 };
    }
    const formData = new FormData();
    formData.append('files[]', attachments[0]);
    formData.append('source', 'attachments');

    if (attachments[0].type.split('/')[0] === 'image') {
        const imageBitmap: ImageBitmap = await createImageBitmap(attachments[0]); // Blob file
        const { width, height } = imageBitmap;
        formData.append('width', width.toString());
        formData.append('height', height.toString());
    }

    const request = await fetch(base + `/attachment`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    if (request.status === 201) {
        return {
            status: 201,
            filename: await request.text()
        };
    } else {
        return { status: request.status };
    }
}

// Get attachment details by filename (length and height for images, video length, etc...)
export async function getAttachmentDetails(filename: string) {
    const request = await fetch(base + `/attachment/${filename}`, { method: 'GET' });

    return { status: request.status, data: await request.json() };
}

// Delete attachment by filename
export async function deleteAttachment(filename: string) {
    const request = await fetch(base + `/attachment/${filename}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

/* Comments */

// Comment on post
export async function comment(post: number, content: string, attachment?: string) {
    const formData = new FormData();
    formData.append('postId', post.toString());
    formData.append('content', content);

    if (attachment) {
        formData.append('filename', attachment);
    }

    const request = await fetch(base + `/comment`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.json();
}

// Get comments on a post by its ID
export async function getCommentsOnPost(post: number, page: number = 0) {
    const request = await fetch(base + `/comment/${post}?page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Like/unlike a comment by its ID
export async function likeComment(comment: number) {
    const request = await fetch(base + `/comment/like/${comment}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Delete comment by its ID
export async function deleteComment(comment: number) {
    const request = await fetch(base + `/comment/${comment}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

/* Subcomments */

// Subcomment on comment
export async function subcomment(comment: number, content: string, attachment?: string) {
    const formData = new FormData();
    formData.append('commentId', comment.toString());
    formData.append('content', content);

    if (attachment) {
        formData.append('filename', attachment);
    }

    const request = await fetch(base + `/subcomment`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}

// Get subcomments on a comment by its ID
export async function getSubcommentsOnComment(comment: number, page: number = 0) {
    const request = await fetch(base + `/subcomment/${comment}?page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Like/unlike a subcomment by its ID
export async function likeSubcomment(subcomment: number) {
    const request = await fetch(base + `/subcomment/like/${subcomment}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Delete subcomment by its ID
export async function deleteSubcomment(subcomment: number) {
    const request = await fetch(base + `/subcomment/${subcomment}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

/* Communities */

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

// Get communities sorted by latest, activity, or members
export async function getCommunities(sortBy: 'latest' | 'activity' | 'members' = 'members', page: number = 0) {
    const request = await fetch(base + `/community/getCommunities?sortBy=${sortBy}&page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
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
    const request = await fetch(base + `/community/${name}`, {
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

// export async function getUserCommunities(): Promise<CommunityINI[]> {
export async function getUserCommunities(): Promise<CommunityINI[]> {
    return [
        {name: "Community1", id: 0},
        {name: "Community2", id: 0},
        {name: "Community3", id: 0},
        {name: "Community4", id: 0},
        {name: "Community5", id: 0},
        {name: "Community6", id: 0},
        {name: "Community7", id: 0},
        {name: "Community8", id: 0},
        {name: "Community9", id: 0},
        {name: "Community10", id: 0}
    ];
}

/* Tags */

// Get All Tags
export async function getTags() {
    const request = await fetch(base + `/tags`, {
        method: 'GET'
    });
    return { status: request.status, data: await request.json() };
}
