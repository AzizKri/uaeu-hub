import { sendToWebSocket } from '../helpers';

export async function handleAdminDeletion(
    env: Env,
    payload: NotificationPayload.AdminDeletion
) {
    const { senderId, receiverId, entityType, entityContent, reason } = payload;

    // Don't send notification to self
    if (senderId === receiverId) return;

    // Store the notification in the database
    const metadata = JSON.stringify({
        entityType,
        content: entityContent.substring(0, 100), // Truncate content for preview
        reason
    });

    await env.DB.prepare(`
        INSERT INTO notification (sender_id, recipient_id, type, metadata)
        VALUES (?, ?, 'admin_deletion', ?)
    `).bind(senderId, receiverId, metadata).run();

    // Send real-time notification via websocket
    await sendToWebSocket(env, {
        senderId,
        receiverId,
        type: 'admin_deletion',
        metadata: {
            entityType,
            content: entityContent.substring(0, 100),
            reason
        }
    });
}
