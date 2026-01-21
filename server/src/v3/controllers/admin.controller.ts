import { Context } from 'hono';

/**
 * Admin Controller
 * Handles admin-specific operations like stats, user management, etc.
 */

/**
 * Get admin dashboard statistics
 * GET /admin/stats
 */
export async function getAdminStats(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');

    // Only logged-in users can access admin stats
    if (!userId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    // Check if user is admin
    const user = await env.DB.prepare(`
        SELECT is_admin FROM user WHERE id = ?
    `).bind(userId).first<{ is_admin: number }>();

    if (!user || user.is_admin !== 1) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    try {
        // Get total users count (excluding deleted users)
        const usersResult = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM user WHERE is_deleted = 0 AND is_anonymous = 0
        `).first<{ count: number }>();

        // Get total posts count
        const postsResult = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM post
        `).first<{ count: number }>();

        // Get total communities count (excluding general community id=0)
        const communitiesResult = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM community WHERE id != 0
        `).first<{ count: number }>();

        // Get top 3 communities by member count (excluding general community)
        const topCommunities = await env.DB.prepare(`
            SELECT id, public_id, name, description, icon, member_count, created_at
            FROM community 
            WHERE id != 0
            ORDER BY member_count DESC 
            LIMIT 3
        `).all<{
            id: number;
            public_id: string;
            name: string;
            description: string;
            icon: string;
            member_count: number;
            created_at: number;
        }>();

        // Get pending reports count
        const pendingReportsResult = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM report WHERE resolved = 0
        `).first<{ count: number }>();

        // Get pending bug reports count
        const pendingBugReportsResult = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM bug_report WHERE status = 'pending'
        `).first<{ count: number }>();

        // Get pending feature requests count
        const pendingFeatureRequestsResult = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM feature_request WHERE status = 'pending'
        `).first<{ count: number }>();

        return c.json({
            stats: {
                totalUsers: usersResult?.count || 0,
                totalPosts: postsResult?.count || 0,
                totalCommunities: communitiesResult?.count || 0,
                pendingReports: pendingReportsResult?.count || 0,
                pendingBugReports: pendingBugReportsResult?.count || 0,
                pendingFeatureRequests: pendingFeatureRequestsResult?.count || 0,
            },
            topCommunities: topCommunities.results || [],
        }, 200);
    } catch (e) {
        console.error('getAdminStats error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

/**
 * Get all users with pagination (admin only)
 * GET /admin/users
 */
export async function getUsers(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;
    const search = c.req.query('search') || '';

    // Only logged-in users can access
    if (!userId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    // Check if user is admin
    const user = await env.DB.prepare(`
        SELECT is_admin FROM user WHERE id = ?
    `).bind(userId).first<{ is_admin: number }>();

    if (!user || user.is_admin !== 1) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    try {
        let users;
        if (search) {
            users = await env.DB.prepare(`
                SELECT id, public_id, username, displayname, email, created_at, is_anonymous, is_admin, is_deleted, suspended_until, is_banned
                FROM user
                WHERE (username LIKE ? OR email LIKE ? OR displayname LIKE ?) AND is_anonymous = 0
                ORDER BY created_at DESC
                LIMIT 20 OFFSET ?
            `).bind(`%${search}%`, `%${search}%`, `%${search}%`, offset).all();
        } else {
            users = await env.DB.prepare(`
                SELECT id, public_id, username, displayname, email, created_at, is_anonymous, is_admin, is_deleted, suspended_until, is_banned
                FROM user
                WHERE is_anonymous = 0
                ORDER BY created_at DESC
                LIMIT 20 OFFSET ?
            `).bind(offset).all();
        }

        return c.json({ users: users.results }, 200);
    } catch (e) {
        console.error('getUsers error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

/**
 * Suspend a user (admin only)
 * POST /admin/users/:userId/suspend
 */
export async function suspendUser(c: Context) {
    const env: Env = c.env;
    const adminUserId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const targetUserId = c.req.param('userId');

    // Only logged-in users can access
    if (!adminUserId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    // Check if user is admin
    const adminUser = await env.DB.prepare(`
        SELECT is_admin FROM user WHERE id = ?
    `).bind(adminUserId).first<{ is_admin: number }>();

    if (!adminUser || adminUser.is_admin !== 1) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    const body = await c.req.json();
    const { days = 7, reason } = body;

    if (!reason) {
        return c.json({ message: 'Reason is required', status: 400 }, 400);
    }

    try {
        // Calculate suspension end time (days from now)
        const suspendedUntil = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);

        await env.DB.prepare(`
            UPDATE user SET suspended_until = ? WHERE id = ?
        `).bind(suspendedUntil, targetUserId).run();

        return c.json({ 
            message: 'User suspended', 
            suspendedUntil,
            status: 200 
        }, 200);
    } catch (e) {
        console.error('suspendUser error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

/**
 * Ban a user (admin only)
 * POST /admin/users/:userId/ban
 */
export async function banUser(c: Context) {
    const env: Env = c.env;
    const adminUserId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const targetUserId = c.req.param('userId');

    // Only logged-in users can access
    if (!adminUserId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    // Check if user is admin
    const adminUser = await env.DB.prepare(`
        SELECT is_admin FROM user WHERE id = ?
    `).bind(adminUserId).first<{ is_admin: number }>();

    if (!adminUser || adminUser.is_admin !== 1) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    const body = await c.req.json();
    const { reason } = body;

    if (!reason) {
        return c.json({ message: 'Reason is required', status: 400 }, 400);
    }

    try {
        await env.DB.prepare(`
            UPDATE user SET is_banned = 1 WHERE id = ?
        `).bind(targetUserId).run();

        return c.json({ message: 'User banned', status: 200 }, 200);
    } catch (e) {
        console.error('banUser error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

/**
 * Unban a user (admin only)
 * POST /admin/users/:userId/unban
 */
export async function unbanUser(c: Context) {
    const env: Env = c.env;
    const adminUserId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const targetUserId = c.req.param('userId');

    // Only logged-in users can access
    if (!adminUserId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    // Check if user is admin
    const adminUser = await env.DB.prepare(`
        SELECT is_admin FROM user WHERE id = ?
    `).bind(adminUserId).first<{ is_admin: number }>();

    if (!adminUser || adminUser.is_admin !== 1) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    try {
        await env.DB.prepare(`
            UPDATE user SET is_banned = 0, suspended_until = NULL WHERE id = ?
        `).bind(targetUserId).run();

        return c.json({ message: 'User unbanned', status: 200 }, 200);
    } catch (e) {
        console.error('unbanUser error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

/**
 * Unsuspend a user (admin only)
 * POST /admin/users/:userId/unsuspend
 */
export async function unsuspendUser(c: Context) {
    const env: Env = c.env;
    const adminUserId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const targetUserId = c.req.param('userId');

    // Only logged-in users can access
    if (!adminUserId || isAnonymous) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    // Check if user is admin
    const adminUser = await env.DB.prepare(`
        SELECT is_admin FROM user WHERE id = ?
    `).bind(adminUserId).first<{ is_admin: number }>();

    if (!adminUser || adminUser.is_admin !== 1) {
        return c.json({ message: 'Forbidden: Admin access required', status: 403 }, 403);
    }

    try {
        await env.DB.prepare(`
            UPDATE user SET suspended_until = NULL WHERE id = ?
        `).bind(targetUserId).run();

        return c.json({ message: 'User unsuspended', status: 200 }, 200);
    } catch (e) {
        console.error('unsuspendUser error:', e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}
