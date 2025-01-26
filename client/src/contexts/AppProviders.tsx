import React from "react";
import UserProvider from "./user/userProvider.tsx";
import WebSocketProvider from "./websocket/WebSocketProvider.tsx";
import { UpdatePostsProvider } from "./updatePosts/UpdatePostsProvider.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function AppProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <WebSocketProvider>
                <UpdatePostsProvider>
                    <GoogleOAuthProvider
                        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                    >
                        {children}
                    </GoogleOAuthProvider>
                </UpdatePostsProvider>
            </WebSocketProvider>
        </UserProvider>
    );
}
