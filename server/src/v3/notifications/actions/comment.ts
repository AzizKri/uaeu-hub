import { getEntity, sendToWebSocket } from '../helpers';

export async function handleComment(env: Env, { senderId, entityId, parentPostId }: NotificationPayload.Comment) {
    // Get the receiver ID and generate a message to send through websocket
    const parentPost = await getEntity(env, parentPostId, 'post') as PostRow;
    const receiverId = parentPost.author_id
    const message = `{user.${senderId}} commented on your post!{comment.${entityId}!}`

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, action, entity_id, entity_type, message)
        VALUES (?, ?, 'comment', ?, 'post', ?)
    `).bind(senderId, receiverId, entityId, message).run();

    // Prepare payload
    const commentPayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: receiverId,
        action: 'comment',
        entityId: entityId,
        entityType: 'post',
        message: message,
        content: parentPost.content
    };

    // Send to websocket
    await sendToWebSocket(env, commentPayload);
}
