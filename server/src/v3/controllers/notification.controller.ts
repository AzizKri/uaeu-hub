import { Context } from 'hono';

export async function getNotifications(c: Context) {
    const env: Env = c.env;

    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    try {
        // Get notifications
        const notifs = await env.DB.prepare(`
            SELECT *
            FROM notification_view
            WHERE recipient_id = ?
        `).bind(userId).all<NotificationView>();

        return c.json(notifs.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function readNotifications(c: Context) {
    const env: Env = c.env;

    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    try {
        // Mark all notifications as read
        await env.DB.prepare(`
            UPDATE notification
            SET is_read = 1
            WHERE recipient_id = ?
        `).bind(userId).run();

        return c.text('Notifications marked as read', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
