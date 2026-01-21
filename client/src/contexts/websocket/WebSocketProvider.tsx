import { createContext, ReactNode, useEffect, useState } from "react";
import { createWebsocketConnection } from '../../api/webSockets.ts';
import {useUser} from "../user/UserContext.ts";

export const WebSocketContext = createContext<WebSocketInterface | null>(null);

export default function WebSocketProvider({ children }: { children: ReactNode }) {
    const { userReady, setSuspended, setBanned } = useUser();
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (!userReady) return;

        createWebsocketConnection().then(
            (websocket) => {
                if (!websocket) {
                    console.log('Failed to create WebSocket connection');
                    return;
                }
                setWs(websocket);

                websocket.onopen = () => console.log('Connection established');
                websocket.onclose = () => console.log('Connection closed');
                websocket.onerror = (error) => console.log('WebSocket error:', error);
                websocket.onmessage = (event) => {
                    console.log('Received message:', event.data);
                    
                    try {
                        const data = JSON.parse(event.data);
                        
                        // Handle penalty notifications
                        if (data.type === 'suspension') {
                            console.log('User suspended:', data.metadata);
                            if (data.metadata?.suspendedUntil) {
                                setSuspended(data.metadata.suspendedUntil);
                            }
                        } else if (data.type === 'ban') {
                            console.log('User banned:', data.metadata);
                            setBanned();
                        }
                    } catch (e) {
                        console.error('Failed to parse WebSocket message:', e);
                    }
                };

                return () => websocket.close();
            },
            (error) => {
                console.error('Failed to create WebSocket connection:', error);
            }
        )
    }, [userReady, setSuspended, setBanned]);

    return <WebSocketContext.Provider value={{ ws }}>{children}</WebSocketContext.Provider>;
}
