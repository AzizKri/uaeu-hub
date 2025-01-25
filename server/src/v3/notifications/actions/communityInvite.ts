import { sendToWebSocket } from '../helpers';

export async function handleCommunityInvite(env: Env, {
    senderId,
    receiverId,
    inviteId,
    communityId
}: NotificationPayload.Invite) {
    const message = `{user.${senderId}} has invited you to the community '{community.${communityId}'!`

    // Insert notification into DB
    await env.DB.prepare(`
                INSERT INTO notification (sender_id, recipient_id, action, entity_id, entity_type, message)
                VALUES (?, ?, 'invite', ?, 'invite', ?)
            `).bind(senderId, receiverId, inviteId, message).run();

    const invitePayload: NotificationPayload.default = {
        senderId,
        receiverId,
        action: 'invite',
        entityId: inviteId,
        entityType: 'invite',
        message
    };
    await sendToWebSocket(env, invitePayload);
}
