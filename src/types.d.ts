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
}

export {};
