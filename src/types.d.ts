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
        authorUsername: string,
        authorDisplayName: string,
        postDate: Date,
        content: string,
        pfp: string,
    }

    enum Page {
        Home,
        Questions
    }
}

export {};
