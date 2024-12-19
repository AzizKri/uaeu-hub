type UserRow = {
    id: number;
    username: string;
    displayName: string;
    email: string;
    auth_provider: string;
    password: string;
    salt: string;
    google_id?: string;
    created_at: string;
    bio?: string;
    pfp?: string;
    is_anonymous: boolean;
}

type UserView = {
    id: number;
    username: string;
    displayName: string;
    auth_provider: string;
    created_at: string;
    bio?: string;
    pfp?: string;
    is_anonymous: boolean;
}

type PostRow = {
    id: number;
    author_id: number;
    // community_id: number;
    content: string;
    post_time: number;
    attachment?: string;
    like_count: number;
    comment_count: number;
}

type PostView = {
    id: number;
    author_id: number;
    author: string;
    displayname?: string;
    pfp?: string;
    // community_id: number;
    // community: string;
    // community_icon: string;
    content: string;
    post_time: number;
    attachment?: string;
    like_count: number;
    comment_count: number;
}

type CommentRow = {
    id: number;
    author: string;
    pfp?: string;
    content: string;
    post_time: number;
    like_count: number;
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
