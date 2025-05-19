import React from "react";

declare global {
    interface SearchResult {
        id: number;
        author: string;
        content: string;
        postTime: number;
        attachment: string | null;
        rank: number;
    }

    interface PostInfo {
        id: number,
        authorUsername: string,
        authorDisplayName: string,
        postDate: Date,
        content: string,
        pfp: string,
        filename?: string,
        likeCount: number,
        commentCount: number,
        type: "POST" | "POST-PAGE" | "NO_COMMUNITY",
        liked: boolean
    }

    interface CommentInfo {
        attachment: string
        author: string
        authorId: number
        content: string
        displayName: string
        id: number
        likeCount: number,
        commentCount: number,
        liked: boolean,
        parentId: number,
        pfp: string,
        postTime: Date,
    }

    interface CommunityInfo {
        id: number
        name: string
        description: string
        icon?: string
        verified: boolean
        public: boolean
        inviteOnly: boolean
        createdAt: Date
        tags: string
        memberCount: number
        isMember?: boolean
    }

    interface CommunityInfoSimple {
        name: string,
        icon?: string,
    }

    interface CommunityINI {
        id: number;
        name: string;
        icon?: string;
    }

    interface Notification {
        id: number;
        recipient_id: number;
        sender_id: number;
        sender: string;
        sender_displayname: string;
        type: string;
        entity_id: number;
        entity_type: string;
        message: string;
        content?: string;
        read: boolean;
        created_at: number;
    }

    interface PostAll {
        postInfo: PostInfo;
        // topCommentInfo?: CommentInfo;
        communityInfo?: CommunityInfoSimple;
    }

    interface UpdatePostsContextInterface {
        posts: React.ReactElement[];
        updatePosts: (page?: number) => void;
        deletePost: (postId: number) => void;
        prependPost: (post: React.ReactElement) => void;
        loading: boolean;
    }

    interface UserInfo {
        id?: number;
        new?: boolean;
        username: string;
        displayName: string;
        bio?: string;
        pfp?: string;
        isAnonymous?: boolean;
        role?: string;
        email?: string;
    }

    interface SignUpErrors {
        displayName?: string;
        email?: string;
        username?: string;
        password?: string;
        global?: string;
    }

    interface LoginErrors {
        identifier?: string;
        password?: string;
        global?: string;
    }


    interface ServerError {
        field?: string;
        message: string;
    }

    interface ServerErrorResponse {
        status: number;
        message?: string;
        errors?: ServerError[];
    }

    interface UserContextInterface {
        user: UserInfo | null;
        userReady: boolean;
        updateUser: (userInfo) => void;
        removeUser: () => void;
        isUser: () => boolean;
    }

    interface GenericMetadata {
        size: number
    }

    interface ImageMetadata extends GenericMetadata {
        width: number,
        height: number,
        animated: boolean
    }

    interface requirementErrors {
        passLengthError: boolean,
        passLowerError: boolean,
        passUpperError: boolean,
        passNumberError: boolean,
        passSpecialError: boolean,
    }

    interface CommunityPreviewProps {
        icon?: string,
        name: string,
        id: number,
        members: number,
        isMember?: boolean,
        onJoin?: (id: number) => void,
        communityInfo?: boolean
    }

    interface WebSocketInterface {
        ws: WebSocket | null;
    }

    interface UploadState {
        status: "IDLE" | "UPLOADING" | "COMPLETED" | "ERROR";
        fileName?: string;
        file: File | null;
        preview?: string | ArrayBuffer | ImageData | null;
    }

    interface LikeMetadata {
        entityId: number;
        entityType: string;
    }

    interface CommentMetadata {
        parentPostId: number;
    }

    interface SubcommentMetadata {
        parentCommentId: number;
    }

    type NotificationMetadata = LikeMetadata | CommentMetadata | SubcommentMetadata;

    interface Notification {
        id: number;
        actionEntityId: number;
        recipientId: number;
        senderId: number;
        sender: string;
        type: string;
        read: boolean;
        metadata: NotificationMetadata;
        createdAt: Date;
    }

}

export {};
