import { sendToWebSocket } from '../helpers';

export async function handleCommunityInvite(env: Env, {
    senderId,
    receiverId,
    inviteId,
    communityId
}: NotificationPayload.Invite) {

    // Insert notification into DB
    await env.DB.prepare(`
                INSERT INTO notification (sender_id, recipient_id, type, action_entity_id, metadata)
                VALUES (?, ?, 'invite', ?, ?)
            `).bind(senderId, receiverId, inviteId, { communityId: communityId }).run();

    const invitePayload: NotificationPayload.default = {
        senderId,
        receiverId,
        type: 'invite',
        actionEntityId: inviteId,
        metadata: {
            communityId: communityId
        }
    };
    await sendToWebSocket(env, invitePayload);
}
