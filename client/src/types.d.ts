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
        filename?: string
        likes: number,
        comments: number,
        isPostPage: boolean,
    }

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
