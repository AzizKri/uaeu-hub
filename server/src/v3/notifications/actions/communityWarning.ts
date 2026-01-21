import { sendToWebSocket } from '../helpers';

export interface CommunityWarningPayload {
    senderId: number;
    receiverId: number;
    communityId: number;
    reason: string;
    communityName?: string;
}

export async function handleCommunityWarning(
    env: Env,
    payload: CommunityWarningPayload
) {
    const { senderId, receiverId, communityId, reason, communityName } = payload;

    // Don't send notification to self
    if (senderId === receiverId) return;

    // Get community name if not provided
    let name = communityName;
    if (!name) {
        const community = await env.DB.prepare(`
            SELECT name FROM community WHERE id = ?
        `).bind(communityId).first<{ name: string }>();
        name = community?.name || 'Unknown Community';
    }

    // Store the notification in the database
    const metadata = JSON.stringify({
        communityId,
        communityName: name,
        reason
    });

    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, metadata)
        VALUES (?, ?, 'community_warning', ?)
    `).bind(senderId, receiverId, metadata).run();

    // Send real-time notification via websocket
    await sendToWebSocket(env, {
        senderId,
        receiverId,
        type: 'community_warning',
        metadata: {
            communityId,
            communityName: name,
            reason
        }
    });
}
