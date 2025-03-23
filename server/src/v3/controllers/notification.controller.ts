import { Context } from 'hono';

export async function getNotifications(c: Context) {
    const env: Env = c.env;

    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.json({}, { status: 200 });

    // Get offset from query
    const offset = parseInt(c.req.query('offset') as string) || 0;

    try {
        // Get notifications
        const notifications = await env.DB.prepare(`
            SELECT *
            FROM notification_view
            WHERE recipient_id = ?
            LIMIT 10 OFFSET ?
        `).bind(userId, offset).all<NotificationView>();

        // Define function for handling hidden entities
        // This is used for including a post's content after a like for example
        // as a 'content' attribute instead of directly in the message
        const handleRequestEntry = async (entityType: string, entityId: number) => {
            console.log('Handling Request:', entityType, entityId);
            switch (entityType) {
                case 'post':
                    return await env.DB.prepare(`
                        SELECT content
                        FROM post
                        WHERE id = ?
                    `).bind(entityId).first<{ content: string }>();
                case 'comment':
                    return await env.DB.prepare(`
                        SELECT content
                        FROM comment
                        WHERE id = ?
                    `).bind(entityId).first<{ content: string }>();
                case 'subcomment':
                    return await env.DB.prepare(`
                        SELECT content
                        FROM subcomment
                        WHERE id = ?
                    `).bind(entityId).first<{ content: string }>();
                default:
                    return { content: '' };
            }
        };

        // Initialize new array for results
        let results: NotificationView[] = [];

        // Define regex for matching entities {entity.id} or {entity.id!} for hidden entities
        const entityRegex = /{(\w+)\.(\d+)(!)?}/gi;

        // Iterate over notifications and match entities
        await Promise.all(notifications.results.map(async (notif) => {
            // Create array of matches
            const matches = Array.from(notif.message.matchAll(entityRegex));

            // Iterate
            for (const match of matches) {
                const [fullMatch, entity, id, hidden] = match;
                console.log('Match:', fullMatch, entity, id, hidden);

                // Handle hidden entities
                if (hidden) {
                    // Get content of entity
                    const entityObj = await handleRequestEntry(entity, parseInt(id));
                    // Append content
                    notif = { ...notif, content: entityObj!.content };
                    // Replace hidden entity with empty string
                    notif.message = notif.message.replace(fullMatch, '');
                } else {
                    // Handle visible entities
                    switch (entity.toLowerCase()) {
                        case 'user':
                            // Mention
                            const username = await env.DB.prepare(`
                                SELECT username
                                FROM user
                                WHERE id = ?
                            `).bind(parseInt(id)).first<{ username: string }>();
                            // Replace entity with username
                            notif.message = notif.message.replace(fullMatch, `@${username!.username}`);
                            break;
                        case 'community':
                            // Invite
                            const community = await env.DB.prepare(`
                                SELECT name
                                FROM community
                                WHERE id = ?
                            `).bind(parseInt(id)).first<{ name: string }>();
                            // Replace entity with community name
                            notif.message = notif.message.replace(fullMatch, community!.name);
                            break;
                        default:
                            // Nothing?
                            break;
                    }
                }
            }

            // Push notification to results
            results.push(notif);
        }));

        // Return results
        return c.json(results, { status: 200 });
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
            SET read = 1
            WHERE recipient_id = ?
        `).bind(userId).run();

        return c.text('Notifications marked as read', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
