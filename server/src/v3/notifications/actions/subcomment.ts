import { getEntity, sendToWebSocket } from '../helpers';

export async function handleSubcomment(env: Env, { senderId, entityId, parentCommentId }: NotificationPayload.Subcomment) {
    // Get the receiver ID and generate a message to send through websocket
    const parentComment = await getEntity(env, parentCommentId, 'comment') as CommentRow;
    const receiverId = parentComment.author_id
    const message = `{user.${senderId}} replied to your comment!{subcomment.${entityId}!}`;

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, action, entity_id, entity_type, message)
        VALUES (?, ?, 'subcomment', ?, 'comment', ?)
    `).bind(senderId, receiverId, entityId, message).run();

    // Prepare payload
    const subcommentPayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: receiverId,
        action: 'subcomment',
        entityId: entityId,
        entityType: 'comment',
        message: message,
        content: parentComment.content
    };

    // Send to websocket
    await sendToWebSocket(env, subcommentPayload);
}
