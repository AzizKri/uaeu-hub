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
        type: string,
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
        parentPostId: number,
        pfp: string,
        postTime: Date,
    }

    interface CommunityInfo {
        id: number
        name: string
        description: string
        icon: string | null
        verified: boolean
        public: boolean
        inviteOnly: boolean
        createdAt: Date
        tags: string
        memberCount: number
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

    interface PostAll {
        postInfo: PostInfo;
        topCommentInfo: CommentInfo | null;
        communityInfo: CommunityInfoSimple;
    }

    // type PostInfoWithTopComment = PostInfo & {
    //     [K in keyof CommentInfo as `top_comment_${K}`]: CommentInfo[K];
    // };

    // interface PostInfoWithTopComment extends PostInfo, CommentInfo {
    //     to_id: number,
    //     to_author_id: number,
    //     to_author_username: string,
    //     to_content: string,
    //     to_like_count: number,
    //     to_post_time: Date
    // }

    interface UpdatePostsContextInterface {
        posts: React.ReactElement[];
        updatePosts: (page? : number) => void;
        deletePost: (postId : number) => void;
        prependPost: (post: React.ReactElement) => void;
        loading: boolean;
    }

    interface UserInfo {
        new?: boolean;
        username: string;
        displayName: string;
        bio?: string;
        pfp?: string;
        isAnonymous?: boolean;
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

    interface WebSocketInterface {
        ws: WebSocket | null;
    }

    interface DocumentMetadata extends GenericMetadata {

    }
}

export {};
