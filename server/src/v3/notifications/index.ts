import { Context } from 'hono';
import { handleLike } from './actions/like';
import { handleComment } from './actions/comment';
import { handleSubcomment } from './actions/subcomment';
import { handleCommunityInvite } from './actions/communityInvite';
import { handleMention } from './actions/mention';

export async function createNotification(
    c: Context, {
        senderId,
        receiverId,
        action,
        entityData,
        parentEntityData
    }: NotificationPayload.IncomingNotificationPayload) {
    const env: Env = c.env;

    // Check required fields
    if (!senderId) throw new Error('No senderID provided');

    switch (action) {
        case 'like':
            const likedEntityType: string = entityData.entityType;
            if (!likedEntityType || !['post', 'comment', 'subcomment'].includes(likedEntityType)) throw new Error('Invalid entityType provided to Like');
            // entityId & type are of the entity being liked
            await handleLike(env, <NotificationPayload.Like>{
                senderId,
                entityId: entityData.entityId,
                entityType: likedEntityType
            });
            break;
        case 'comment':
            if (!parentEntityData || !parentEntityData.entityId) throw new Error('Post ID not provided for comment');
            // entityId is of the parent post
            await handleComment(env, <NotificationPayload.Comment>{
                senderId,
                entityId: entityData.entityId,
                parentPostId: parentEntityData.entityId
            });
            break;
        case 'subcomment':
            if (!parentEntityData || !parentEntityData.entityId) throw new Error('Comment ID not provided for subcomment');
            // entityId is of the parent comment
            await handleSubcomment(env, <NotificationPayload.Subcomment>{
                senderId,
                entityId: entityData.entityId,
                parentCommentId: parentEntityData.entityId
            });
            break;
        case 'invite':
            if (!receiverId) throw new Error('No receiver ID provided');
            if (!entityData.inviteId || !entityData.communityId) throw new Error('No invite ID or community ID provided');
            await handleCommunityInvite(env, <NotificationPayload.Invite>{
                senderId,
                receiverId,
                inviteId: entityData.inviteId,
                communityId: entityData.communityId
            });
            break;
        case 'mention':
            if (!receiverId) throw new Error('No receiver ID provided');
            await handleMention(env, <NotificationPayload.Mention>{
                senderId,
                receiverId,
                entityId: entityData.entityId,
                entityType: entityData.entityType
            })
            break;
        default:
            throw new Error('Invalid action provided');
    }
}
