import { getEntityAuthorId, sendToWebSocket } from '../helpers';

export async function handleLike(env: Env, { senderId, entityId, entityType }: NotificationPayload.Like) {
    // Get the receiver ID and generate a message to send through websocket
    const receiverId: number = await getEntityAuthorId(env, entityId, entityType);

    const metadata = {
        entityId: entityId,
        entityType: entityType
    }

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, metadata)
        VALUES (?, ?, 'like', ?)
    `).bind(senderId, receiverId, JSON.stringify(metadata)).run();

    // Prepare payload
    const likePayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: receiverId,
        type: 'like',
        metadata: metadata
    };

    // Send to websocket
    await sendToWebSocket(env, likePayload);
}
