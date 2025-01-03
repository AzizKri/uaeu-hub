import {createContext} from "react";

export const UpdatePostsContext = createContext<UpdatePostsContextInterface | null>(null);
export const UserContext = createContext<UserContextInterface | null>(null);
export const WebSocketContext = createContext<WebSocketInterface | null>(null);
