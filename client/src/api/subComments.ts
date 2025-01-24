const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/subcomment';

// SubComment on comment
export async function subComment(comment: number, content: string, attachment?: string) {
    const formData = new FormData();
    formData.append('commentId', comment.toString());
    formData.append('content', content);

    if (attachment) {
        formData.append('filename', attachment);
    }

    const request = await fetch(base, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return {status: request.status, data: await request.json()};
}

// Get subComments on a comment by its ID
export async function getSubCommentsOnComment(comment: number, page: number = 0) {
    const request = await fetch(base + `/${comment}?page=${page}`, {
        method: 'GET',
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}

// Like/unlike a subComment by its ID
export async function likeSubComment(subComment: number) {
    const request = await fetch(base + `/like/${subComment}`, {
        method: 'POST',
        credentials: 'include'
    });
    return request.status;
}

// Delete subComment by its ID
export async function deleteSubComment(subComment: number) {
    const request = await fetch(base + `/${subComment}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

