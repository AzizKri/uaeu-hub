import { getEntity, sendToWebSocket } from '../helpers';

export async function handleSubcomment(env: Env, {
    senderId,
    subcommentId,
    parentCommentId,
    content
}: NotificationPayload.Subcomment) {
    // Get the receiver ID and generate a message to send through websocket
    const ParentComment = await getEntity(env, parentCommentId, 'comment') as CommentRow;

    // Don't notify yourself
    if (senderId === ParentComment.author_id) return;

    const metadata = {
        parentCommentId,
        parentPostId: ParentComment.parent_post_id,
        content: content
    }

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, action_entity_id, metadata)
        VALUES (?, ?, 'subcomment', ?, ?)
    `).bind(senderId, ParentComment.author_id, subcommentId, JSON.stringify(metadata)).run();

    // Prepare payload
    const subcommentPayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: ParentComment.author_id,
        type: 'subcomment',
        actionEntityId: subcommentId,
        metadata: metadata
    };

    // Send to websocket
    await sendToWebSocket(env, subcommentPayload);
}
