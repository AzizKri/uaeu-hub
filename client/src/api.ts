const base = 'https://api.uaeu.chat';
// const base = 'http://127.0.0.1:8787';
const cdn = 'https://cdn.uaeu.chat';

// api.uaeu.chat/user/anon
// TODO generating anon sessions
// export async function generateAnonSessionID() {
// 	await fetch(base + `/user/anon`, { credentials: "include" })
// 		.then(() => {localStorage.setItem('anon', 'true')})
// 		.catch((e) => {
// 		console.log(e);
// 	});
// }

// api.uaeu.chat/user/signup
export async function signUp(formData: { displayname: string, email: string, username: string, password: string }) {
    const data = await fetch(base + `/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    return await data.json();
}

// api.uaeu.chat/user/login
export async function login(formData: { username: string, password: string } | { email: string, password: string }) {
    const data = await fetch(base + `/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    return await data.json();
}

export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`);
    return await request.json();
}

// POSTS

// api.uaeu.chat/post/latest/:page
export async function getLatestPosts(page?: number) {
    const request = await fetch(base + `/post/latest/${page || 0}`);
    return await request.json();
}

// api.uaeu.chat/post/search/:query
export async function searchPosts(query: string) {
    const request = await fetch(base + `/post/search/${query}`);
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
export async function uploadAttachment(attachment: File) {
    const formData = new FormData();
    formData.append('file', attachment);

    const request = await fetch(base + `/attachment`, {
        method: 'POST',
        body: formData
    });

    if (request.status === 201) {
        return await request.text();
    } else {
        return request.status;
    }
}

// api.uaeu.chat/post
export async function createPostNew(author: string, content: string, attachment: File | null) {
    const formData = new FormData();
    formData.append('author', author);
    formData.append('content', content);

    if (attachment) {
        formData.append('file', attachment);
    }

    const request = await fetch(base + `/post`, {
        method: 'POST',
        body: formData
    });
    return request.status;
}

// api.uaeu.chat/post/create
export async function createPost(author: string, content: string, attachment: File | null) {
    const formData = new FormData();
    formData.append('author', author);
    formData.append('content', content);

    if (attachment) {
        formData.append('file', attachment);
    }

    const request = await fetch(base + `/post/create`, {
        method: 'POST',
        body: formData
    });
    return request.status;
}

// api.uaeu.chat/post/user/:username/:page
export async function getPostsByUser(username: string, page: number | null) {
    const request = await fetch(base + `/post/user/${username}/${page || 0}`);
    return await request.json();
}

// api.uaeu.chat/post/:id
export async function getPostByID(id: number) {
    const request = await fetch(base + `/post/${id}`);
    return await request.json();
}

// api.uaeu.chat/attachment/:filename
export async function getAttachmentDetails(filename: string) {
    const request = await fetch(cdn + `/attachments/${filename}`, { method: 'HEAD' });
    return request.headers.get('Content-Type');
}
