import { getEntity, sendToWebSocket } from '../helpers';

export async function handleLike(env: Env, { senderId, entityId, entityType }: NotificationPayload.Like) {
    // Get the receiver ID and generate a message to send through websocket
    const {
        receiverId: likeReceiverId,
        message: likeMessage,
        content: entityContent
    } = await getLikedEntity(env, { senderId, entityId, entityType });

    // Insert notification into DB
    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, action, entity_id, entity_type, message)
        VALUES (?, ?, 'like', ?, ?, ?)
    `).bind(senderId, likeReceiverId, entityId, entityType, likeMessage).run();

    // Prepare payload
    const likePayload: NotificationPayload.default = {
        senderId: senderId,
        receiverId: likeReceiverId,
        action: 'like',
        entityId: entityId,
        entityType: entityType,
        message: likeMessage,
        content: entityContent
    };

    // Send to websocket
    await sendToWebSocket(env, likePayload);
}

async function getLikedEntity(env: Env, { senderId, entityId, entityType }: NotificationPayload.Like) {
    switch (entityType) {
        case 'post':
            const postEntity = await getEntity(env, entityId, entityType) as PostRow;
            return {
                receiverId: postEntity.author_id,
                content: postEntity.content,
                message: `{user.${senderId}} liked your post!{post.${entityId}!}`
            };
        case 'comment':
            const commentEntity = await getEntity(env, entityId, entityType) as CommentRow;
            return {
                receiverId: commentEntity.author_id,
                content: commentEntity.content,
                message: `{user.${senderId}} liked your comment!{comment.${entityId}!}`
            };
        case 'subcomment':
            const subcommentEntity = await getEntity(env, entityId, entityType) as SubcommentRow;
            return {
                receiverId: subcommentEntity.author_id,
                content: subcommentEntity.content,
                message: `{user.${senderId}} liked your reply!{subcomment.${entityId}!}`
            };
        default:
            throw new Error('Invalid entity type');
    }
}
