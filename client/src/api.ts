const base = import.meta.env.VITE_API_URL || 'https://api.uaeu.chat';

/* Authentication */
export async function signUp(formData: { displayname: string, email: string, username: string, password: string }) {
    const data = await fetch(base + `/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
    return data;
}

export async function login(formData: { username: string, password: string } | { email: string, password: string }) {
    const data = await fetch(base + `/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
    return data;
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
    const request = await fetch(base + `/user`, { credentials: 'include' });
    return await request.json();
}

// Returns the liked posts data for the current user
export async function getLikesCurrentUser() {
    const request = await fetch(base + `/user/likes`, { credentials: 'include' });
    return await request.json();
}

/* Users */

// Get user data by session key
export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`, { credentials: 'include' });
    return await request.json();
}

// Get posts sent by user (username)
export async function getPostsByUser(username: string, page?: number) {
    const request = await fetch(base + `/post/user/${username}/${page || 0}`, { credentials: 'include' });
    return await request.json();
}

/* Posts */

// Create post
export async function createPost(content: string, attachment?: string) {
    const formData = new FormData();
    formData.append('content', content);

    if (attachment) {
        formData.append('filename', attachment);
    }

    const request = await fetch(base + `/post`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}

// Get latest posts
export async function getLatestPosts(page?: number) {
    const request = await fetch(base + `/post/latest/${page || 0}`, { credentials: 'include' });
    return await request.json();
}

// Search post by query
export async function searchPosts(query: string) {
    const request = await fetch(base + `/post/search/${query}`, { credentials: 'include' });
    if (request.status === 400) {
        return { results: [] };
    }
    return await request.json();
}

// Get post by ID
export async function getPostByID(id: number) {
    const request = await fetch(base + `/post/${id}`, { credentials: 'include' });
    return await request.json();
}

// Toggle like on post by its ID
export async function toggleLike(post: number) {
    const request = await fetch(base + `/post/like/${post}`, {
        method: 'POST',
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
    formData.append('postid', post.toString());
    formData.append('content', content);

    if (attachment) {
        formData.append('filename', attachment);
    }

    const request = await fetch(base + `/comment`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return request.status;
}

// Get comments on a post by its ID
export async function getCommentsOnPost(post: number, page: number | 0) {
    const request = await fetch(base + `/comment/${post}/${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return await request.json();
}
