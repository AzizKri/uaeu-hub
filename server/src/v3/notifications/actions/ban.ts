import { sendToWebSocket } from '../helpers';

export interface BanPayload {
    senderId: number;
    receiverId: number;
    reason: string;
}

export async function handleBan(
    env: Env,
    payload: BanPayload
) {
    const { senderId, receiverId, reason } = payload;

    // Don't send notification to self
    if (senderId === receiverId) return;

    // Store the notification in the database
    const metadata = JSON.stringify({
        reason
    });

    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, metadata)
        VALUES (?, ?, 'ban', ?)
    `).bind(senderId, receiverId, metadata).run();

    // Send real-time notification via websocket
    await sendToWebSocket(env, {
        senderId,
        receiverId,
        type: 'ban',
        metadata: {
            reason
        }
    });
}
