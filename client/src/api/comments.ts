const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/comment';

// Comment on post
export async function comment(post: number, content: string, attachment?: string) {
    const formData = new FormData();
    formData.append('postId', post.toString());
    formData.append('content', content);

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

// Get comments on a post by its ID
export async function getCommentsOnPost(post: number, page: number = 0) {
    const request = await fetch(base + `/${post}?page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Like/unlike a comment by its ID
export async function likeComment(comment: number) {
    const request = await fetch(base + `/like/${comment}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Delete comment by its ID
export async function deleteComment(comment: number) {
    const request = await fetch(base + `/${comment}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

