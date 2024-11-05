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

    interface UpdatePostsContestInterface {
        posts: React.ReactElement[];
        updatePosts: () => void;
    }
}

export {};
