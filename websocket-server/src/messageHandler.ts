import { sendMessage } from './clients';

export function handleIncomingMessage(clientId: string, message: string): void {
    try {
        console.log(`Received message from client ${clientId}: ${message}.toString()`);
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'notification':
                handleNotification(parsedMessage.payload);
                break;
            default:
                console.log(`Unknown message type: ${parsedMessage.type}`);
        }
    } catch (e) {
        console.error(e);
    }
}

// Handle notification messages
function handleNotification(payload: any): void {
    // Send the notification to the client
    const { recipientId, message } = payload;
    sendMessage(recipientId, JSON.stringify(message));
}
