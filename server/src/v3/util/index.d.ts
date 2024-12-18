type UserRow = {
    id: number;
    username: string;
    password: string;
    salt: string;
    displayName: string;
    email: string;
    auth_provider: string;
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

type SessionRow = {
    id: string;
    user_id: number;
    created_at: number;
}

type AttachmentMetadata = {
    width?: string,
    height?: string
}
