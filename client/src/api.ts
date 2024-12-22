// production
const base = 'https://api.uaeu.chat/v3';
// const cdn = 'https://cdn.uaeu.chat';

// dev
// const base = 'http://127.0.0.1:8787/v3';
// const cdn = 'https://r2.uaeu.chat';

// api.uaeu.chat/user/signup
export async function signUp(formData: { displayname: string, email: string, username: string, password: string }) {
    const data = await fetch(base + `/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
    return await data.json();
}

// api.uaeu.chat/user/login
export async function login(formData: { username: string, password: string } | { email: string, password: string }) {
    const data = await fetch(base + `/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
    });
    return await data.json();
}

export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`, { credentials: 'include' });
    return await request.json();
}

export async function isUser() {
    const request = await fetch(base + `/user/isUser`, { credentials: 'include' });
    return request.status === 200; // true if status is 200, otherwise false (401 Unauthorized or 500 Internal Server Error)
}

// POSTS

// api.uaeu.chat/post/latest/:page
export async function getLatestPosts(page?: number) {
    const request = await fetch(base + `/post/latest/${page || 0}`, { credentials: 'include' });
    return await request.json();
}

// api.uaeu.chat/post/search/:query
export async function searchPosts(query: string) {
    const request = await fetch(base + `/post/search/${query}`, { credentials: 'include' });
    if (request.status === 400) {
        return { results: [] };
    }
    return await request.json();
}

/* returns
* {
*   ...
*   "results": [
*      {
*           "id": number,
*           "author": string,
*           "content": string,
*           "post_time": number,
*           "attachment": string | null,
*           "rank": float
*       }
*   ]
* }
* */

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

// api.uaeu.chat/attachment
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

// api.uaeu.chat/post
export async function createPost(content: string, attachment: string | null) {
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

// api.uaeu.chat/post/user/:username/:page
export async function getPostsByUser(username: string, page: number | null) {
    const request = await fetch(base + `/post/user/${username}/${page || 0}`, { credentials: 'include' });
    return await request.json();
}

// api.uaeu.chat/post/:id
export async function getPostByID(id: number) {
    const request = await fetch(base + `/post/${id}`, { credentials: 'include' });
    return await request.json();
}

// api.uaeu.chat/attachment/:filename
export async function getAttachmentDetails(filename: string) {
    const request = await fetch(base + `/attachment/${filename}`, { method: 'GET' });

    return { status: request.status, data: await request.json() };
}

// api.uaeu.chat/post
export async function comment(post: number, parentType: string, content: string, attachment: string | null, parentLevel?: number) {
    const formData = new FormData();
    formData.append('postid', post.toString());
    formData.append('parent-type', parentType);
    formData.append('parent-level', parentLevel ? parentLevel.toString() : '-1');
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

// api.uaeu.chat/post
export async function getCommentsOnPost(post: number, page: number | 0) {
    const request = await fetch(base + `/comment/${post}/${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return await request.json();
}

// api.uaeu.chat/post/like/:id
export async function toggleLike(post: number) {
    const request = await fetch(base + `/post/like/${post}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}
