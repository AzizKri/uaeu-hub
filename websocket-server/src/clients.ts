import WebSocket from 'ws';

const clients: Map<string, { ws: WebSocket, userId: number }> = new Map(); // clientId -> { ws, userId }

// Add a new client to the clients map
export function addClient(ws: WebSocket, userId: number): string {
    const clientId = generateUniqueId();
    clients.set(clientId, { ws, userId });
    return clientId;
}

// Remove a client from the clients map
export function removeClient(clientId: string): void {
    clients.delete(clientId);
}

// Get clientId by user ID
export function getClientByUserId(userId: number): WebSocket | null {
    for (const [clientId, client] of clients) {
        if (client.userId === userId) {
            return client.ws;
        }
    }
    return null;
}

// Send message to a specific client
export function sendMessage(clientId: string, message: string): void {
    const client = clients.get(clientId);
    if (client) {
        client.ws.send(message);
    }
}

// Broadcast message to all clients
export function broadcastMessage(message: string): void {
    clients.forEach((client) => {
        client.ws.send(message);
    });
}

// Generate a unique ID for the client
function generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Heartbeat to clean up inactive connections
setInterval(() => {
    clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.ping();
        } else {
            console.log(`Removing inactive client ${clientId}`);
            clients.delete(clientId);
        }
    });
}, 2 * 60 * 1000); // every 2 minutes

