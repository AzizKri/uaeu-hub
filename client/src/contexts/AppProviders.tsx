import React from "react";
import UserProvider from "./user/userProvider.tsx";
import WebSocketProvider from "./websocket/WebSocketProvider.tsx";
import { UpdatePostsProvider } from "./updatePosts/UpdatePostsProvider.tsx";

export default function AppProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <WebSocketProvider>
                <UpdatePostsProvider>
                    {children}
                </UpdatePostsProvider>
            </WebSocketProvider>
        </UserProvider>
    );
}
