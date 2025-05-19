import { getEntityAuthorId, sendToWebSocket } from '../helpers';

export async function handleComment(env: Env, { senderId, commentId, parentPostId }: NotificationPayload.Comment) {
    // Get the receiver ID and generate a message to send through websocket
    const receiverId = await getEntityAuthorId(env, parentPostId, 'post');

    const metadata = {
        parentPostId: parentPostId
    }

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, action_entity_id, metadata)
        VALUES (?, ?, 'comment', ?, ?)
    `).bind(senderId, receiverId, commentId, metadata).run();

    // Prepare payload
    const commentPayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: receiverId,
        type: 'comment',
        actionEntityId: commentId,
        metadata: metadata
    };

    // Send to websocket
    await sendToWebSocket(env, commentPayload);
}
