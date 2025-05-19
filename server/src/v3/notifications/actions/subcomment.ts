import { getEntityAuthorId, sendToWebSocket } from '../helpers';

export async function handleSubcomment(env: Env, {
    senderId,
    subcommentId,
    parentCommentId
}: NotificationPayload.Subcomment) {
    // Get the receiver ID and generate a message to send through websocket
    const receiverId: number = await getEntityAuthorId(env, parentCommentId, 'comment');
    const parentPostId = await env.DB.prepare(`
        SELECT parent_post_id
        FROM comment
        WHERE id = ?
    `).bind(parentCommentId).first<number>();

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, action_entity_id, metadata)
        VALUES (?, ?, 'subcomment', ?, ?)
    `).bind(senderId, receiverId, subcommentId, JSON.stringify({ parentCommentId, parentPostId })).run();

    // Prepare payload
    const subcommentPayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: receiverId,
        type: 'subcomment',
        actionEntityId: subcommentId,
        metadata: { parentCommentId, parentPostId }
    };

    // Send to websocket
    await sendToWebSocket(env, subcommentPayload);
}
