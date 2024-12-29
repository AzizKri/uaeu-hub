import React from "react";

declare global {
    interface SearchResult {
        id: number;
        author: string;
        content: string;
        post_time: number;
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
        like_count: number,
        comment_count: number,
        type: string,
        liked: boolean
    }

    interface CommentInfo {
        attachment: string
        author: string
        author_id: number
        content: string
        display_name: string
        id: number
        level: number
        like_count: number,
        // comment_count: number,
        liked: boolean,
        parent_post_id: number,
        parent_type: string,
        pfp: string,
        post_time: Date,
    }

    interface CommunityInfo {
        id: number
        name: string
        description: string
        icon: string | null
        verified: boolean
        public: boolean
        invite_only: boolean
        created_at: Date
        tags: string
        member_count: number
    }

    interface CommunityInfoSimple {
        name: string,
        icon: string | null,
    }

    interface PostAll {
        post_info: PostInfo;
        top_comment_info: CommentInfo | null;
        community_info: CommunityInfoSimple;
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
        loading: boolean;
    }

    interface userInfo {
        username: string;
        displayName: string;
        bio: string;
        pfp: string;
    }

    interface signUpErrors {
        displayname?: string;
        email?: string;
        username?: string;
        password?: string;
        global?: string;
    }

    interface loginErrors {
        email?: string;
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
        user: userInfo | null;
        updateUser: (userInfo) => void;
        removeUser: () => void;
    }

    interface GenericMetadata {
        size: number
    }

    interface ImageMetadata extends GenericMetadata {
        width: number,
        height: number,
        animated: boolean
    }

    interface DocumentMetadata extends GenericMetadata {

    }
}

export {};
