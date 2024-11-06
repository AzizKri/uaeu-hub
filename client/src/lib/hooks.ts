import {useContext} from "react";
import {UpdatePostsContext, UserContext} from "./context.ts";

export const useUpdatePosts = () => {
    const context = useContext(UpdatePostsContext);
    if (!context) {
        throw new Error('useUpdatePosts must be used within a provider');
    }
    return context;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a provider');
    }
    return context;
}
