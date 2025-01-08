import {base} from "./api.ts";

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

