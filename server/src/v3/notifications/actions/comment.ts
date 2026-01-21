import { getEntity, sendToWebSocket } from '../helpers';

export async function handleComment(env: Env, { senderId, commentId, parentPostId, content }: NotificationPayload.Comment) {
    // Get the receiver ID and generate a message to send through websocket
    const Entity = await getEntity(env, parentPostId, 'post') as PostRow;

    // Don't notify yourself
    if (senderId === Entity.author_id) return;

    const metadata = {
        parentPostId: parentPostId,
        content: content
    }

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, action_entity_id, metadata)
        VALUES (?, ?, 'comment', ?, ?)
    `).bind(senderId, Entity.author_id, commentId, JSON.stringify(metadata)).run();

    // Prepare payload
    const commentPayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: Entity.author_id,
        type: 'comment',
        actionEntityId: commentId,
        metadata: metadata
    };

    // Send to websocket
    await sendToWebSocket(env, commentPayload);
}
