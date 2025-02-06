import { Context } from 'hono';

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
