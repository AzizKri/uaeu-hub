type UserRow = {
    username: string;
    displayName: string;
    email: string;
    password: string,
    created_at: string;
    bio?: string;
    pfp?: string;
}

type PostRow = {
    id: number;
    author: string;
    content: string;
    post_time: number;
    displayname: string;
    pfp?: string;
    like_count: number;
    comment_count: number;
    attachment?: string;
}

type AttachmentRow = {
    filename: string;
    mimetype: string;
    metadata: string;
    created_at: number;
}
