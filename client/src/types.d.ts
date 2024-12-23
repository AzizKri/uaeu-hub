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
        author: {
            username: string,
            displayname: string,
            pfp: string
        },
        date: Date,
        content: string,
        filename?: string
        likes: number,
        comments_count: number,
        type: string,
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
        attachment: string,
        author: string,
        author_id: number,
        content: string,
        displayname: string,
        id: number,
        level: number,
        like_count: number,
        liked: boolean,
        parent_post_id: number,
        parent_type: string,
        pfp: string,
        post_time: string,
    }

    interface PostsContextInterface {
        posts: PostInfo[];
        updatePosts: (page? : number) => void;
        loading: boolean;
    }

    interface UserInfo {
        username: string;
        displayName: string;
        pio: string;
        pfp: string;
    }
    interface UserContextInterface {
        user: UserInfo | null;
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
