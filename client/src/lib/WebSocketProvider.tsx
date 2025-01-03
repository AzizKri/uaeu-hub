import { ReactNode, useEffect, useState } from 'react';
import { createWebsocketConnection } from '../api.ts';
import { WebSocketContext } from './context.ts';

export default function WebSocketProvider({ children }: { children: ReactNode }) {
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        createWebsocketConnection().then(
            (websocket) => {
                if (!websocket) {
                    console.log('Failed to create WebSocket connection');
                    return;
                }
                setWs(ws);

                websocket.onopen = () => console.log('Connection established');
                websocket.onclose = () => console.log('Connection closed');
                websocket.onerror = (error) => console.log('WebSocket error:', error);
                websocket.onmessage = (event) => console.log('Received message:', event.data);

                return () => websocket.close();
            },
            (error) => {
                console.error('Failed to create WebSocket connection:', error);
            }
        )
    }, [ws]);

    return <WebSocketContext.Provider value={{ ws }}>{children}</WebSocketContext.Provider>;
}
