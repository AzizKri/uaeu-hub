import { Context } from 'hono';
import { handleLike } from './actions/like';
import { handleComment } from './actions/comment';
import { handleSubcomment } from './actions/subcomment';
import { handleCommunityInvite } from './actions/communityInvite';
import { handleAdminDeletion } from './actions/adminDeletion';
import { handleSuspension } from './actions/suspension';
import { handleBan } from './actions/ban';
import { handleCommunityWarning } from './actions/communityWarning';

export async function createNotification(
    c: Context, {
        senderId,
        receiverId,
        type,
        metadata
    }: NotificationPayload.IncomingNotificationPayload) {
    const env: Env = c.env;

    // Check required fields
    if (!senderId) throw new Error('No senderID provided');

    switch (type) {
        case 'like':
            const likedEntityType: string = metadata.entityType;
            if (!likedEntityType || !['post', 'comment', 'subcomment'].includes(likedEntityType)) throw new Error('Invalid entityType provided to Like');
            // entityId & type are of the entity being liked
            await handleLike(env, <NotificationPayload.Like>{
                senderId,
                entityId: metadata.entityId,
                entityType: likedEntityType
            });
            break;
        case 'comment':
            if (!metadata || !metadata.commentId) throw new Error('Post ID not provided for comment');
            // entityId is of the parent post
            await handleComment(env, <NotificationPayload.Comment>{
                senderId: senderId,
                commentId: metadata.commentId,
                parentPostId: metadata.parentPostId,
                content: metadata.content
            });
            break;
        case 'subcomment':
            if (!metadata || !metadata.subcommentId) throw new Error('Comment ID not provided for subcomment');
            // entityId is of the parent comment
            await handleSubcomment(env, <NotificationPayload.Subcomment>{
                senderId: senderId,
                subcommentId: metadata.subcommentId,
                parentCommentId: metadata.parentCommentId,
                content: metadata.content
            });
            break;
        case 'invite':
            if (!receiverId) throw new Error('No receiver ID provided');
            if (!metadata.inviteId || !metadata.communityId) throw new Error('No invite ID or community ID provided');
            await handleCommunityInvite(env, <NotificationPayload.Invite>{
                senderId,
                receiverId,
                inviteId: metadata.inviteId,
                communityId: metadata.communityId
            });
            break;
        case 'mention':
            throw new Error('Not implemented yet');
        case 'admin_deletion':
            if (!receiverId) throw new Error('No receiver ID provided');
            if (!metadata.entityType || !metadata.reason) throw new Error('Missing entityType or reason for admin deletion');
            await handleAdminDeletion(env, <NotificationPayload.AdminDeletion>{
                senderId,
                receiverId,
                entityType: metadata.entityType,
                entityContent: metadata.entityContent || '',
                reason: metadata.reason
            });
            break;
        case 'suspension':
            if (!receiverId) throw new Error('No receiver ID provided');
            if (!metadata.suspendedUntil || !metadata.reason) throw new Error('Missing suspendedUntil or reason for suspension');
            await handleSuspension(env, {
                senderId,
                receiverId,
                suspendedUntil: metadata.suspendedUntil,
                reason: metadata.reason
            });
            break;
        case 'ban':
            if (!receiverId) throw new Error('No receiver ID provided');
            if (!metadata.reason) throw new Error('Missing reason for ban');
            await handleBan(env, {
                senderId,
                receiverId,
                reason: metadata.reason
            });
            break;
        case 'community_warning':
            if (!receiverId) throw new Error('No receiver ID provided');
            if (!metadata.communityId || !metadata.reason) throw new Error('Missing communityId or reason for community warning');
            await handleCommunityWarning(env, {
                senderId,
                receiverId,
                communityId: metadata.communityId,
                reason: metadata.reason,
                communityName: metadata.content
            });
            break;
        default:
            throw new Error('Invalid action provided');
    }
}
