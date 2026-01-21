import { getEntity, sendToWebSocket } from '../helpers';

export async function handleLike(env: Env, { senderId, entityId, entityType }: NotificationPayload.Like) {
    // Get the receiver ID and generate a message to send through websocket
    const Entity = await getEntity(env, entityId, entityType);

    // Don't notify yourself
    if (senderId === Entity.author_id) return;

    const metadata = {
        entityId: entityId,
        entityType: entityType,
        content: Entity.content
    }

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, metadata)
        VALUES (?, ?, 'like', ?)
    `).bind(senderId, Entity.author_id, JSON.stringify(metadata)).run();

    // Prepare payload
    const likePayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: Entity.author_id,
        type: 'like',
        metadata: metadata
    };

    // Send to websocket
    await sendToWebSocket(env, likePayload);
}
