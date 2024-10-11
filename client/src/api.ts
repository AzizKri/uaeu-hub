const base = 'https://api.talente.dev';

export async function getUserByUsername(username: string) {
	const request = await fetch(base + `/user/${username}`);
	return await request.json();
}

// api.uaeu.chat/post/latest/:page
export async function getLatestPosts(page?: number | null) {
	const request = await fetch(base + `/post/latest/${page || 0}`);
	return await request.json();
}

// api.uaeu.chat/post/create
export async function createPost(author: string | null, content: string) {
	try {
		const request = await fetch(base + `/post/create`, {
			body: JSON.stringify({ author, content }),
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});
		return await request.json();
	} catch (error) {
		console.error("Failed to create post: ", error);
	}
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