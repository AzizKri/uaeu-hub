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

type PostLikeRow = {
    post_id: number;
    user_id: number;
    created_at: number;
}

type CommentLikeRow = {
    post_id: number;
    user_id: number;
    created_at: number;
}

type SubcommentLikeRow = {
    post_id: number;
    user_id: number;
    created_at: number;
}

type CommentRow = {
    id: number;
    parent_post_id: number;
    author_id: number;
    content: string;
    post_time: number;
    attachment?: string;
    like_count: number;
    comment_count: number;
}

type CommentView = {
    id: number;
    parent_post_id: number;
    author_id: number;
    author: string;
    pfp?: string;
    displayname?: string;
    content: string;
    post_time: number;
    like_count: number;
    comment_count: number;
    attachment?: string;
}

type SubcommentRow = {
    id: number;
    parent_comment_id: number;
    author_id: number;
    author: string;
    content: string;
    post_time: number;
    like_count: number;
    attachment?: string;
}

type SubcommentView = {
    id: number;
    parent_comment_id: number;
    author_id: number;
    author: string;
    pfp?: string;
    displayname?: string;
    content: string;
    post_time: number;
    like_count: number;
    attachment?: string;
}

type AttachmentMetadata = {
    width?: string,
    height?: string
}

type AttachmentRow = {
    filename: string;
    mimetype: string;
    metadata: string;
    created_at: number;
    author_id: number;
}

type SessionRow = {
    id: string;
    user_id: number;
    created_at: number;
}

type CommunityRow = {
    id: number;
    name: string;
    description: string;
    icon: string;
    verified: boolean;
    public: boolean;
    invite_only: boolean;
    created_at: number;
    tags: string;
    member_count: number;
}

type CommunityRoleRow = {
    id: number;
    community_id: number;
    name: string;
    level: number;
    read_posts: boolean;
    write_posts: boolean;
    administrator: boolean;
}

type CommunityMemberRow = {
    user_id: number;
    community_id: number;
    joined_at: number;
    role_id: number;
}

type TagRow = {
    id: number;
    name: string;
}

type cookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none' | 'Strict' | 'Lax' | 'None';
    domain?: string;
    maxAge: number;
}
