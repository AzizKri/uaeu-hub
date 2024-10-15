const base = 'https://api.uaeu.chat';
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

export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/user/${username}`);
    return await request.json();
}

// POSTS

// api.uaeu.chat/post/latest/:page
export async function getLatestPosts(page?: number | null) {
    const request = await fetch(base + `/post/latest/${page || 0}`);
    return await request.json();
}

// api.uaeu.chat/post/search/:query
export async function searchPosts(query: string) {
    const request = await fetch(base + `/post/search/${query}`);
    return await request.json();
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
