import { sendToWebSocket } from '../helpers';

export interface SuspensionPayload {
    senderId: number;
    receiverId: number;
    suspendedUntil: number;
    reason: string;
}

export async function handleSuspension(
    env: Env,
    payload: SuspensionPayload
) {
    const { senderId, receiverId, suspendedUntil, reason } = payload;

    // Don't send notification to self
    if (senderId === receiverId) return;

    // Store the notification in the database
    const metadata = JSON.stringify({
        suspendedUntil,
        reason
    });

    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, metadata)
        VALUES (?, ?, 'suspension', ?)
    `).bind(senderId, receiverId, metadata).run();

    // Send real-time notification via websocket
    await sendToWebSocket(env, {
        senderId,
        receiverId,
        type: 'suspension',
        metadata: {
            suspendedUntil,
            reason
        }
    });
}
