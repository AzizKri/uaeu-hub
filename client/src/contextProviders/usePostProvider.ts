import {useContext} from "react";
import {UpdatePostsContext} from "./UpdatePostProvider.tsx";

export const useUpdatePosts = () => {
    const context = useContext(UpdatePostsContext);
    if (!context) {
        throw new Error('useUpdatePosts must be used within a provider');
    }
    return context;
};
