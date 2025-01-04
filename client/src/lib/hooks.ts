import {useContext} from "react";
import { UpdatePostsContext, UserContext, WebSocketContext } from './context.ts';

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

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a provider');
    }
    return context;
}
