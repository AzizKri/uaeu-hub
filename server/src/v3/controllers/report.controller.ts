import { Context } from 'hono';
import { createNotification } from '../notifications';

export async function createReport(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');

    // Only logged-in users can report
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get data from validated json
    const {
        entityId,
        entityType,
        reportType,
        reason
        // @ts-ignore
    } = c.req.valid('json');

    // Check if the entity exists
    switch (entityType) {
        case 'user':
            const user = await env.DB.prepare(`
                SELECT id
                FROM user
                WHERE id = ?
            `).bind(entityId).first<UserRow>();

            if (!user) return c.json({ message: 'User not found', status: 404 }, 404);
            break;
        case 'post':
            const post = await env.DB.prepare(`
                SELECT id
                FROM post
                WHERE id = ?
            `).bind(entityId).first<PostRow>();

            if (!post) return c.json({ message: 'Post not found', status: 404 }, 404);
            break;
        case 'comment':
            const comment = await env.DB.prepare(`
                SELECT id
                FROM comment
                WHERE id = ?
            `).bind(entityId).first<CommentRow>();

            if (!comment) return c.json({ message: 'Comment not found', status: 404 }, 404);
            break;
        case 'subcomment':
            const subcomment = await env.DB.prepare(`
                SELECT id
                FROM subcomment
                WHERE id = ?
            `).bind(entityId).first<SubcommentRow>();

            if (!subcomment) return c.json({ message: 'Subcomment not found', status: 404 }, 404);
            break;
        case 'community':
            const community = await env.DB.prepare(`
                SELECT id
                FROM community
                WHERE id = ?
            `).bind(entityId).first<CommunityRow>();

            if (!community) return c.json({ message: 'Community not found', status: 404 }, 404);
            break;
        default:
            return c.json({ message: 'Invalid entity type', status: 400 }, 400);
    }

    // Insert report into db
    await env.DB.prepare(`
        INSERT INTO report (reporter_id, entity_id, entity_type, report_type, reason)
        VALUES (?, ?, ?, ?, ?)
    `).bind(userId, entityId, entityType, reportType, reason).run();

    return c.json({ message: 'Report submitted', status: 200 }, 200);
}

export async function getReports(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const includeResolved = c.req.query('includeResolved') ? c.req.query('includeResolved') === 'true' : false;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    // Only logged-in users can view reports
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Check if global admin
    if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get all reports
    const reports = await env.DB.prepare(`
        SELECT *
        FROM report
        WHERE resolved = ?
        ORDER BY created_at DESC
        LIMIT 20 OFFSET ?
    `).bind(includeResolved, offset).all<ReportRow>();

    return c.json({ reports }, 200);
}

export async function getReportsForCommunity(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const communityId = c.req.param('communityId') ? Number(c.req.param('communityId')) : -1;
    const includeResolved = c.req.query('includeResolved') ? c.req.query('includeResolved') === 'true' : false;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    // Only logged-in users can view reports
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Check if the community exists
    if (communityId === -1) return c.json({ message: 'Community ID required', status: 400 }, 400);
    const community = await env.DB.prepare(`
        SELECT id
        FROM community
        WHERE id = ?
    `).bind(communityId).first<CommunityRow>();
    if (!community) return c.json({ message: 'Community not found', status: 404 }, 404);

    // Check if the user is an administrator of the community
    if (!await isCommunityAdmin(env, communityId, userId) &&
        !await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get all reports
    const reports = await env.DB.prepare(`
        SELECT r.*
        FROM report r
                 JOIN (SELECT id, 'post' AS entity_type
                       FROM post
                       WHERE community_id = ?
                       UNION ALL
                       SELECT c.id, 'comment'
                       FROM comment
                                JOIN post p ON c.parent_post_id = p.id
                       WHERE p.community_id = ?
                       UNION ALL
                       SELECT s.id, 'subcomment'
                       FROM subcomment
                                JOIN comment c ON s.parent_comment_id = c.id
                                JOIN post p ON c.parent_post_id = p.id
                       WHERE p.community_id = ?) AS entities
                      ON r.entity_id = entities.id AND r.entity_type = entities.entity_type
        WHERE r.resolved = ?
        ORDER BY r.created_at DESC
        LIMIT 20 OFFSET ?
    `).bind(communityId, communityId, communityId, includeResolved, offset).all<ReportRow>();

    return c.json({ reports }, 200);
}

export async function getReport(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const reportId = c.req.param('reportId');

    // Only logged-in users can view reports
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);
    if (!reportId || isNaN(Number(reportId))) return c.json({ message: 'Report ID required', status: 400 }, 400);

    // Get the report
    const report = await env.DB.prepare(`
        SELECT *
        FROM report
        WHERE id = ?
    `).bind(reportId).first<ReportRow>();

    if (!report) return c.json({ message: 'Report not found', status: 404 }, 404);

    // Get the entity
    let entity;
    switch (report.entity_type) {
        case 'user':
            // Check if user is a global admin
            if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);

            entity = await env.DB.prepare(`
                SELECT id, username, display_name, bio, pfp
                FROM user
                WHERE id = ?
            `).bind(report.entity_id).first<UserRow>();
            break;
        case 'post':
            entity = await env.DB.prepare(`
                SELECT id, user_id, community_id, content, created_at
                FROM post
                WHERE id = ?
            `).bind(report.entity_id).first<PostRow>();
            if (!await isCommunityAdmin(env, entity!.community_id, userId)) return c.json({
                message: 'Unauthorized',
                status: 401
            }, 401);
            break;
        case 'comment':
            entity = await env.DB.prepare(`
                SELECT id,
                       user_id,
                       post_id,
                       content,
                       created_at,
                       (SELECT community_id FROM post WHERE id = parent_post_id) as community_id
                FROM comment
                WHERE id = ?
            `).bind(report.entity_id).first<CommentRow>() as (CommentRow & { community_id: number });
            if (!await isCommunityAdmin(env, entity!.community_id, userId)) return c.json({
                message: 'Unauthorized',
                status: 401
            }, 401);
            break;
        case 'subcomment':
            entity = await env.DB.prepare(`
                SELECT id, user_id, comment_id, content, created_at
                FROM subcomment
                WHERE id = ?
            `).bind(report.entity_id).first<SubcommentRow>() as (SubcommentRow & { community_id: number });
            if (!await isCommunityAdmin(env, entity!.community_id, userId)) return c.json({
                message: 'Unauthorized',
                status: 401
            }, 401);
            break;
        case 'community':
            // Check if user is a global admin
            if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);

            entity = await env.DB.prepare(`
                SELECT id, name, description, created_at
                FROM community
                WHERE id = ?
            `).bind(report.entity_id).first<CommunityRow>();
            break;
        default:
            return c.json({ message: 'Invalid entity type', status: 400 }, 400);
    }

    return c.json({ entity: entity, report: report }, 200);
}

export async function resolveReport(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    // @ts-ignore
    const { reportId, communityId } = c.req.valid('json');

    // Only logged-in users can resolve reports
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Check if the report exists
    const report = await env.DB.prepare(`
        SELECT *
        FROM report
        WHERE id = ?
    `).bind(reportId).first<ReportRow>();

    if (!report) return c.json({ message: 'Report not found', status: 404 }, 404);

    // Check if user is authorized
    switch (report.entity_type) {
        case 'user':
            if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);
            break;
        case 'post':
            if (!await isCommunityAdmin(env, communityId, userId) &&
                !await isGlobalAdmin(env, userId)) return c.json({
                message: 'Unauthorized',
                status: 401
            }, 401);
            break;
        case 'comment':
            if (!await isCommunityAdmin(env, communityId, userId) &&
                !await isGlobalAdmin(env, userId)) return c.json({
                message: 'Unauthorized',
                status: 401
            }, 401);
            break;
        case 'subcomment':
            if (!await isCommunityAdmin(env, communityId, userId) &&
                !await isGlobalAdmin(env, userId)) return c.json({
                message: 'Unauthorized',
                status: 401
            }, 401);
            break;
        case 'community':
            if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);
            break;
        default:
            return c.json({ message: 'Invalid entity type', status: 400 }, 400);
    }

    // Resolve
    await env.DB.prepare(`
        UPDATE report
        SET resolved = true
        WHERE id = ?
    `).bind(reportId).run();

    return c.json({ message: 'Report resolved', status: 200 }, 200);
}

/**
 * Take action on a report
 * POST /report/:reportId/action
 */
export async function takeReportAction(c: Context) {
    const env: Env = c.env;
    const adminUserId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const reportId = c.req.param('reportId');

    // Only logged-in admins can take action
    if (!adminUserId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    // Check if global admin
    if (!await isGlobalAdmin(env, adminUserId)) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    const body = await c.req.json();
    const { action, reason } = body;

    if (!action || !['delete', 'delete_suspend', 'delete_ban', 'warn', 'dismiss'].includes(action)) {
        return c.json({ message: 'Invalid action', status: 400 }, 400);
    }

    if (action !== 'dismiss' && !reason) {
        return c.json({ message: 'Reason is required', status: 400 }, 400);
    }

    // Get the report
    const report = await env.DB.prepare(`
        SELECT * FROM report WHERE id = ?
    `).bind(reportId).first<ReportRow>();

    if (!report) {
        return c.json({ message: 'Report not found', status: 404 }, 404);
    }

    try {
        let targetUserId: number | null = null;
        let entityContent: string = '';

        // Get entity and target user based on entity type
        switch (report.entity_type) {
            case 'post': {
                const post = await env.DB.prepare(`
                    SELECT id, author_id, content FROM post WHERE id = ?
                `).bind(report.entity_id).first<{ id: number; author_id: number; content: string }>();
                if (post) {
                    targetUserId = post.author_id;
                    entityContent = post.content;
                }
                break;
            }
            case 'comment': {
                const comment = await env.DB.prepare(`
                    SELECT id, author_id, content FROM comment WHERE id = ?
                `).bind(report.entity_id).first<{ id: number; author_id: number; content: string }>();
                if (comment) {
                    targetUserId = comment.author_id;
                    entityContent = comment.content;
                }
                break;
            }
            case 'subcomment': {
                const subcomment = await env.DB.prepare(`
                    SELECT id, author_id, content FROM subcomment WHERE id = ?
                `).bind(report.entity_id).first<{ id: number; author_id: number; content: string }>();
                if (subcomment) {
                    targetUserId = subcomment.author_id;
                    entityContent = subcomment.content;
                }
                break;
            }
            case 'community': {
                // For communities, we warn the admins
                const community = await env.DB.prepare(`
                    SELECT id, name, owner_id FROM community WHERE id = ?
                `).bind(report.entity_id).first<{ id: number; name: string; owner_id: number }>();
                if (community) {
                    targetUserId = community.owner_id;
                    entityContent = community.name;
                }
                break;
            }
            case 'user': {
                targetUserId = report.entity_id;
                const user = await env.DB.prepare(`
                    SELECT username FROM user WHERE id = ?
                `).bind(report.entity_id).first<{ username: string }>();
                if (user) {
                    entityContent = user.username;
                }
                break;
            }
        }

        // Execute the action
        if (action === 'dismiss') {
            // Just mark as resolved without any other action
            await env.DB.prepare(`
                UPDATE report SET resolved = 1 WHERE id = ?
            `).bind(reportId).run();
            return c.json({ message: 'Report dismissed', status: 200 }, 200);
        }

        if (action === 'warn' && report.entity_type === 'community') {
            // Send warning notification to community admins
            const communityAdmins = await env.DB.prepare(`
                SELECT uc.user_id 
                FROM user_community uc
                JOIN community_role cr ON uc.role_id = cr.id
                WHERE uc.community_id = ? AND cr.administrator = 1
            `).bind(report.entity_id).all<{ user_id: number }>();

            for (const admin of communityAdmins.results || []) {
                await createNotification(c, {
                    senderId: adminUserId,
                    receiverId: admin.user_id,
                    type: 'community_warning',
                    metadata: {
                        communityId: report.entity_id,
                        reason: reason,
                        content: entityContent
                    }
                });
            }

            // Mark report as resolved
            await env.DB.prepare(`
                UPDATE report SET resolved = 1 WHERE id = ?
            `).bind(reportId).run();

            return c.json({ message: 'Community admins warned', status: 200 }, 200);
        }

        // Delete the entity (for delete, delete_suspend, delete_ban)
        if (['delete', 'delete_suspend', 'delete_ban'].includes(action)) {
            switch (report.entity_type) {
                case 'post':
                    await env.DB.prepare(`DELETE FROM post WHERE id = ?`).bind(report.entity_id).run();
                    break;
                case 'comment':
                    await env.DB.prepare(`DELETE FROM comment WHERE id = ?`).bind(report.entity_id).run();
                    break;
                case 'subcomment':
                    await env.DB.prepare(`DELETE FROM subcomment WHERE id = ?`).bind(report.entity_id).run();
                    break;
                // Communities and users are not deleted directly
            }

            // Send notification about deletion
            if (targetUserId) {
                await createNotification(c, {
                    senderId: adminUserId,
                    receiverId: targetUserId,
                    type: 'admin_deletion',
                    metadata: {
                        entityType: report.entity_type,
                        entityContent: entityContent.substring(0, 100),
                        reason: reason
                    }
                });
            }
        }

        // Apply suspension or ban
        if (action === 'delete_suspend' && targetUserId) {
            // Suspend for 7 days
            const suspendedUntil = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
            await env.DB.prepare(`
                UPDATE user SET suspended_until = ? WHERE id = ?
            `).bind(suspendedUntil, targetUserId).run();

            // Send suspension notification
            await createNotification(c, {
                senderId: adminUserId,
                receiverId: targetUserId,
                type: 'suspension',
                metadata: {
                    suspendedUntil: suspendedUntil,
                    reason: reason
                }
            });
        }

        if (action === 'delete_ban' && targetUserId) {
            await env.DB.prepare(`
                UPDATE user SET is_banned = 1 WHERE id = ?
            `).bind(targetUserId).run();

            // Send ban notification
            await createNotification(c, {
                senderId: adminUserId,
                receiverId: targetUserId,
                type: 'ban',
                metadata: {
                    reason: reason
                }
            });
        }

        // Mark report as resolved
        await env.DB.prepare(`
            UPDATE report SET resolved = 1 WHERE id = ?
        `).bind(reportId).run();

        return c.json({ 
            message: `Action '${action}' executed successfully`, 
            status: 200 
        }, 200);

    } catch (e) {
        console.error('takeReportAction error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

/**
 * Get reports with entity details for admin panel
 * GET /report/admin/all
 */
export async function getReportsWithDetails(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const includeResolved = c.req.query('includeResolved') === 'true';
    const entityType = c.req.query('entityType') || null;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    // Only logged-in admins can access
    if (!userId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    if (!await isGlobalAdmin(env, userId)) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    try {
        let query = `
            SELECT r.*, u.username as reporter_username
            FROM report r
            LEFT JOIN user u ON r.reporter_id = u.id
            WHERE 1=1
        `;
        const params: (string | number | boolean)[] = [];

        if (!includeResolved) {
            query += ` AND r.resolved = 0`;
        }

        if (entityType) {
            query += ` AND r.entity_type = ?`;
            params.push(entityType);
        }

        query += ` ORDER BY r.created_at DESC LIMIT 20 OFFSET ?`;
        params.push(offset);

        const reports = await env.DB.prepare(query).bind(...params).all();

        // Fetch entity details for each report
        const reportsWithDetails = await Promise.all(
            (reports.results || []).map(async (report: any) => {
                let entity = null;
                let entityAuthor = null;

                switch (report.entity_type) {
                    case 'post': {
                        const post = await env.DB.prepare(`
                            SELECT p.*, u.username as author_username, u.displayname as author_displayname,
                                   a.mimetype as attachment_mime, a.metadata as attachment_metadata
                            FROM post p
                            LEFT JOIN user u ON p.author_id = u.id
                            LEFT JOIN attachment a ON p.attachment = a.filename
                            WHERE p.id = ?
                        `).bind(report.entity_id).first();
                        entity = post;
                        break;
                    }
                    case 'comment': {
                        const comment = await env.DB.prepare(`
                            SELECT c.*, u.username as author_username, u.displayname as author_displayname,
                                   a.mimetype as attachment_mime, a.metadata as attachment_metadata
                            FROM comment c
                            LEFT JOIN user u ON c.author_id = u.id
                            LEFT JOIN attachment a ON c.attachment = a.filename
                            WHERE c.id = ?
                        `).bind(report.entity_id).first();
                        entity = comment;
                        break;
                    }
                    case 'subcomment': {
                        const subcomment = await env.DB.prepare(`
                            SELECT s.*, u.username as author_username, u.displayname as author_displayname,
                                   a.mimetype as attachment_mime, a.metadata as attachment_metadata
                            FROM subcomment s
                            LEFT JOIN user u ON s.author_id = u.id
                            LEFT JOIN attachment a ON s.attachment = a.filename
                            WHERE s.id = ?
                        `).bind(report.entity_id).first();
                        entity = subcomment;
                        break;
                    }
                    case 'community': {
                        const community = await env.DB.prepare(`
                            SELECT c.*, u.username as owner_username
                            FROM community c
                            LEFT JOIN user u ON c.owner_id = u.id
                            WHERE c.id = ?
                        `).bind(report.entity_id).first();
                        entity = community;
                        break;
                    }
                    case 'user': {
                        const user = await env.DB.prepare(`
                            SELECT id, username, displayname, bio, pfp, created_at
                            FROM user WHERE id = ?
                        `).bind(report.entity_id).first();
                        entity = user;
                        break;
                    }
                }

                return {
                    ...report,
                    entity
                };
            })
        );

        return c.json({ reports: reportsWithDetails }, 200);
    } catch (e) {
        console.error('getReportsWithDetails error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

// MISC

async function isCommunityAdmin(env: Env, communityId: number, userId: number) {
    return !!(await env.DB.prepare(
        `SELECT 1
         FROM user_community
         WHERE user_id = ?
           AND community_id = ?
           AND role_id = (SELECT id FROM community_role WHERE community_id = ? AND administrator = true)`
    ).bind(userId, communityId, communityId).first<CommunityMemberRow>());
}

async function isGlobalAdmin(env: Env, userId: number) {
    const user = await env.DB.prepare(`
        SELECT is_admin
        FROM user
        WHERE id = ?
    `).bind(userId).first<UserRow>();
    return !!(user?.is_admin);
}
