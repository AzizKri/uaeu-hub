type UserRow = {
    id: string;
    public_id?: string;
    username: string;
    displayname: string;
    email?: string;
    email_verified: boolean;
    password?: string;
    salt?: string;
    created_at: string;
    bio?: string;
    pfp?: string;
    is_anonymous: boolean;
    is_admin: number;
    is_deleted: boolean;
    suspended_until?: number;
    is_banned?: boolean;
}

type UserView = {
    id: string;
    public_id?: string;
    username: string;
    displayname: string;
    created_at: string;
    bio?: string;
    pfp?: string;
    is_anonymous: boolean;
    is_deleted: boolean;
}

type PasswordResetRow = {
    token: string;
    user_id: string;
    used: boolean;
    created_at: number;
}

type PostRow = {
    id: number;
    author_id: string;
    community_id: number;
    content: string;
    post_time: number;
    attachment?: string;
    like_count: number;
    comment_count: number;
}

type PostView = {
    id: number;
    author_id: string;
    author: string;
    displayname?: string;
    pfp?: string;
    community_id: number;
    community: string;
    community_icon: string;
    content: string;
    post_time: number;
    attachment?: string;
    like_count: number;
    comment_count: number;
}

type PostLikeRow = {
    post_id: number;
    user_id: string;
    created_at: number;
}

type CommentLikeRow = {
    post_id: number;
    user_id: string;
    created_at: number;
}

type SubcommentLikeRow = {
    post_id: number;
    user_id: string;
    created_at: number;
}

type CommentRow = {
    id: number;
    parent_post_id: number;
    author_id: string;
    content: string;
    post_time: number;
    attachment?: string;
    like_count: number;
    comment_count: number;
}

type CommentView = {
    id: number;
    parent_post_id: number;
    author_id: string;
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
    author_id: string;
    author: string;
    content: string;
    post_time: number;
    like_count: number;
    attachment?: string;
}

type SubcommentView = {
    id: number;
    parent_comment_id: number;
    author_id: string;
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
    author_id: string;
}

type SessionRow = {
    id: string;
    user_id: string;
    created_at: number;
    is_anonymous: boolean;
    ip: string;
}

type EmailVerificationRow = {
    token: string;
    user_id: string;
    email: string;
    used: boolean;
    created_at: number;
}

type WebSocketRow = {
    user_id: string;
    socket_id: string;
    created_at: number;
    used: boolean;
}

type CommunityRow = {
    role?: string;
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
    owner_id: string;
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
    user_id: string;
    community_id: number;
    joined_at: number;
    role_id: number;
}

type CommunityInviteRow = {
    id: number;
    community_id: number;
    sender_id: string;
    recipient_id: string;
    created_at: number;
}

type TagRow = {
    id: number;
    name: string;
}

type NotificationView = {
    id: number;
    sender_id: string;
    recipient_id: string;
    sender: string;
    type: string;
    action_entity_id: number;
    metadata?: string;
    read: boolean;
    created_at: number;
}

type ReportRow = {
    id: number;
    reporter_id: string;
    entity_id: string;
    entity_type: string;
    report_type: string;
    reason: string;
    created_at: number;
}

namespace NotificationPayload {
    export default interface NotificationPayload {
        senderId: string;
        receiverId: string;
        type: 'like' | 'comment' | 'subcomment' | 'mention' | 'invite' | 'admin_deletion' | 'suspension' | 'ban' | 'community_warning';
        actionEntityId?: number;
        content?: string;
        metadata: {[key: string]: any};
    }
    export type IncomingNotificationPayload = {
        senderId: string;
        receiverId?: string;
        type: 'like' | 'comment' | 'subcomment' | 'mention' | 'invite' | 'admin_deletion' | 'suspension' | 'ban' | 'community_warning';
        metadata: NotificationMetadata[NotificationMetadata.Like | NotificationMetadata.Comment | NotificationMetadata.Subcomment];
    }
    export type Like = {
        senderId: string;
        entityId: number;
        entityType: 'post' | 'comment' | 'subcomment';
    }
    export type Comment = {
        senderId: string;
        commentId: number;
        parentPostId: number;
        content: string;
    }
    export type Subcomment = {
        senderId: string;
        subcommentId: number;
        parentCommentId: number;
        content: string;
    }
    export type Mention = {
        senderId: string;
        receiverId: string;
        entityId: number;
        entityType: 'post' | 'comment' | 'subcomment';
    }
    export type Invite = {
        senderId: string;
        receiverId: string;
        inviteId: number;
        communityId: number;
    }
    export type AdminDeletion = {
        senderId: string;
        receiverId: string;
        entityType: 'post' | 'comment' | 'subcomment';
        entityContent: string;
        reason: string;
    }
    export type Suspension = {
        senderId: string;
        receiverId: string;
        suspendedUntil: number;
        reason: string;
    }
    export type Ban = {
        senderId: string;
        receiverId: string;
        reason: string;
    }
    export type CommunityWarning = {
        senderId: string;
        receiverId: string;
        communityId: number;
        communityName: string;
        reason: string;
    }
}

namespace NotificationMetadata {
    export type Like = {
        likeId: number,
        entityId: number,
        entityType: 'post' | 'comment' | 'subcomment',
    }
    export type Comment = {
        commentId: number,
        parentPostId: number,
    }
    export type Subcomment = {
        subcommentId: number,
        parentCommentId: number,
    }
}

type cookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none' | 'Strict' | 'Lax' | 'None';
    domain?: string;
    maxAge: number;
}
