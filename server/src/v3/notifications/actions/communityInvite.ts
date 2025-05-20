import { sendToWebSocket } from '../helpers';

export async function handleCommunityInvite(env: Env, {
    senderId,
    receiverId,
    inviteId,
    communityId
}: NotificationPayload.Invite) {

    // Get community name
    const community = await env.DB.prepare(`
        SELECT name
        FROM community
        WHERE id = ?
    `).bind(communityId).first<{ name: string }>();

    const metadata = {
        communityId: communityId,
        communityName: community!.name
    }

    // Insert notification into DB
    await env.DB.prepare(`
                INSERT INTO notification (sender_id, recipient_id, type, action_entity_id, metadata)
                VALUES (?, ?, 'invite', ?, ?)
            `).bind(senderId, receiverId, inviteId, JSON.stringify(metadata)).run();

    const invitePayload: NotificationPayload.default = {
        senderId,
        receiverId,
        type: 'invite',
        actionEntityId: inviteId,
        metadata: metadata
    };
    await sendToWebSocket(env, invitePayload);
}
