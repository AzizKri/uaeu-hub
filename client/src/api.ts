// production
const base = 'https://api.uaeu.chat/v3';
const cdn = 'https://cdn.uaeu.chat';

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

// api.uaeu.chat/attachment
export async function uploadAttachment(attachments: File[]) {
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
            filename: await request.text() };
    } else {
        return { status: request.status };
    }
}

// api.uaeu.chat/post
export async function createPost(author: string, content: string, attachment: string | null) {
    const formData = new FormData();
    formData.append('author', author);
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

// api.uaeu.chat/post/create
export async function createPostOld(author: string, content: string, attachment: File | null) {
    const formData = new FormData();
    formData.append('author', author);
    formData.append('content', content);

    if (attachment) {
        formData.append('file', attachment);
    }

    const request = await fetch(base + `/post/create`, {
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
    const request = await fetch(cdn + `/attachments/${filename}`, { method: 'HEAD' });
    return request.headers.get('Content-Type');
}
