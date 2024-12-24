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

    // interface CommentInfo {
    //     commentId: number,
    //     authorUsername: string,
    //     authorDisplayName: string,
    //     // commentDate: Date,
    //     level: number,
    //     content: string,
    //     pfp: string,
    //     filename?: string
    //     // upVotes: number,
    //     // downVotes: number,
    // }

    interface CommentInfo {
        attachment: string
        author: string
        author_id: number
        content: string
        display_name: string
        id: number
        level: number
        like_count: number,
        liked: boolean,
        parent_post_id: number,
        parent_type: string,
        pfp: string,
        post_time: string,
    }

    interface PostInfoWithTopComment {
        post_info: PostInfo;
        top_comment_info: CommentInfo;
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
        pio: string;
        pfp: string;
    }
    interface UserContextInterface {
        user: userInfo | null;
        updateUser: (userInfo) => void;
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
