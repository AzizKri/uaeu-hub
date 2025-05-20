import { getEntityAuthorId, sendToWebSocket } from '../helpers';

export async function handleSubcomment(env: Env, {
    senderId,
    subcommentId,
    parentCommentId
}: NotificationPayload.Subcomment) {
    // Get the receiver ID and generate a message to send through websocket
    const receiverId: number = await getEntityAuthorId(env, parentCommentId, 'comment');
    const Comment = await env.DB.prepare(`
        SELECT parent_post_id
        FROM comment
        WHERE id = ?
    `).bind(parentCommentId).first<CommentRow>();

    const metadata = {
        parentCommentId,
        parentPostId: Comment!.parent_post_id
    }

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, action_entity_id, metadata)
        VALUES (?, ?, 'subcomment', ?, ?)
    `).bind(senderId, receiverId, subcommentId, JSON.stringify(metadata)).run();

    // Prepare payload
    const subcommentPayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: receiverId,
        type: 'subcomment',
        actionEntityId: subcommentId,
        metadata: metadata
    };

    // Send to websocket
    await sendToWebSocket(env, subcommentPayload);
}
