declare global {
    interface Res {
        userId: number;
        id: number;
        title: string;
        body: string;
    }

    interface ResList {
        results: Res[];
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
        comments: number
    }

    interface UpdatePostsContestInterface {
        updatePosts: () => void
    }
}

export {};
