import { Context } from 'hono';

export async function createNotification(
    c: Context, {
        senderId,
        receiverId,
        action,
        entityId,
        entityType,
        message
    }: {
        senderId?: number;
        receiverId?: number;
        action?: 'like' | 'comment' | 'subcomment' | 'mention';
        entityId?: number;
        entityType?: 'post' | 'comment' | 'subcomment';
        message?: string;
    }) {
    const env: Env = c.env;

    switch (action) {
        case 'like':
            // Check required fields
            if (!entityId || !entityType || !senderId) throw new Error('No entity ID or type provided');

            // Get the receiver ID and generate a message to send through websocket
            const { receiverId: rid, message: msg } = await handleLike(env, senderId, entityId, entityType);

            // Reassign
            receiverId = rid;
            message = msg;
            console.log(message);

            // Insert notification into DB
            await env.DB.prepare(`
                INSERT INTO notification (sender_id, recipient_id, action, entity_id, entity_type)
                VALUES (?, ?, ?, ?, ?)
            `).bind(senderId, receiverId, action, entityId, entityType).run();

            // Prepare payload
            const payload = {
                senderId: senderId,
                receiverId: receiverId,
                action: action,
                entityId: entityId,
                entityType: entityType
            }

            console.log('Sending to websocket');
            // Send to websocket
            try {
                const request = await fetch(env.WEBSOCKET_URL + '/notify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                })
                console.log(request, 'Notification sent');
            } catch (e) {
                console.error(e);
                throw new Error('Failed to send notification');
            }

            break;
        case 'comment':
            message = `User ${senderId} commented on your post`;
            break;
        case 'subcomment':
            message = `User ${senderId} replied to your comment`;
            break;
        case 'mention':
            message = `User ${senderId} mentioned you in a comment`;
            break;
        default:
            throw new Error('Invalid notification type');
    }
}

async function handleLike(env: Env, senderId: number, entityId: number, entityType: 'post' | 'comment' | 'subcomment') {
    switch (entityType) {
        case 'post':
            const postEntity = await getEntity(env, entityId, entityType) as PostRow;
            return { receiverId: postEntity.author_id, message: `User ${senderId} liked your post` };
        case 'comment':
            const commentEntity = await getEntity(env, entityId, entityType) as CommentRow;
            return { receiverId: commentEntity.author_id, message: `User ${senderId} liked your comment` };
        case 'subcomment':
            const subcommentEntity = await getEntity(env, entityId, entityType) as SubcommentRow;
            return { receiverId: subcommentEntity.author_id, message: `User ${senderId} liked your reply` };
        default:
            throw new Error('Invalid entity type');
    }
}

async function getEntity(env: Env, entityId: number, entityType: 'post' | 'comment' | 'subcomment'): Promise<PostRow | CommentRow | SubcommentRow> {
    switch (entityType) {
        case 'post':
            const pE = await env.DB.prepare(`
                SELECT author_id
                FROM post
                WHERE id = ?
            `).bind(entityId).first<PostRow>();
            if (!pE) throw new Error('Invalid entity ID');
            return pE;
        case 'comment':
            const cE = await env.DB.prepare(`
                SELECT author_id
                FROM comment
                WHERE id = ?
            `).bind(entityId).first<CommentRow>();
            if (!cE) throw new Error('Invalid entity ID');
            return cE;
        case 'subcomment':
            const scE = await env.DB.prepare(`
                SELECT author_id
                FROM subcomment
                WHERE id = ?
            `).bind(entityId).first<SubcommentRow>();
            if (!scE) throw new Error('Invalid entity ID');
            return scE;
        default:
            throw new Error('Invalid entity type');
    }
}

