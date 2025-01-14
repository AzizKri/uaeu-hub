import { createRoot } from 'react-dom/client';
import './styles/index.scss';
import UserProvider from './lib/providers/userProvider.tsx';
import { UpdatePostProvider } from './lib/providers/UpdatePostProvider.tsx';
import WebSocketProvider from './lib/providers/WebSocketProvider.tsx';
import { Routes } from './routes.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
    <UserProvider>
        <WebSocketProvider>
            <UpdatePostProvider>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <Routes />
                </GoogleOAuthProvider>
            </UpdatePostProvider>
        </WebSocketProvider>
    </UserProvider>
);
