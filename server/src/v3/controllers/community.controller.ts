import { Context } from 'hono';
import { getSignedCookie } from 'hono/cookie';
import { getUserFromSessionKey } from '../util/util';

export async function getCommunity(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const { name } = c.req.param();

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            // New user, get without memberships
            const community = await env.DB.prepare(`
                SELECT *
                FROM community
                WHERE id = ?
            `).bind(name).first<CommunityRow>();

            return c.json(community, { status: 200 });
        } else {
            // Existing user, is it anon?
            const anon = await env.DB.prepare(`
                SELECT is_anonymous
                FROM user
                WHERE id = ?
            `).bind(userid).first<boolean>();

            if (anon) {
                // Anon, get without memberships
                const community = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    WHERE id = ?
                `).bind(name).first<CommunityRow>();

                return c.json(community, { status: 200 });
            } else {
                // Get communities with membership status
                const community = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM community_member WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    WHERE id = ?
                `).bind(userid, name).first<CommunityRow>();

                return c.json(community, { status: 200 });
            }
        }
    } catch (e) {
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunitiesSortByMembers(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const order: string = c.req.query('order') ? c.req.query('order') as string : 'desc';
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *
                FROM community
                ORDER BY ?
                LIMIT 10 OFFSET ?
            `).bind(`member_count ${order.toUpperCase()}`, page).all<CommunityRow>();

            return c.json(communities, { status: 200 });
        } else {
            // Existing user, is it anon?
            const anon = await env.DB.prepare(`
                SELECT is_anonymous
                FROM user
                WHERE id = ?
            `).bind(userid).first<boolean>();

            if (anon) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(`member_count ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM community_member WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(userid, `member_count ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities, { status: 200 });
            }
        }
    } catch (e) {
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunitiesSortByCreation(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const order: string = c.req.query('order') ? c.req.query('order') as string : 'desc';
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *
                FROM community
                ORDER BY ?
                LIMIT 10 OFFSET ?
            `).bind(`created_at ${order.toUpperCase()}`, page).all<CommunityRow>();

            return c.json(communities, { status: 200 });
        } else {
            // Existing user, is it anon?
            const anon = await env.DB.prepare(`
                SELECT is_anonymous
                FROM user
                WHERE id = ?
            `).bind(userid).first<boolean>();

            if (anon) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(`created_at ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM community_member WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(userid, `created_at ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities, { status: 200 });
            }
        }
    } catch (e) {
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunitiesSortByActivity(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const order: string = c.req.query('order') ? c.req.query('order') as string : 'desc';
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *,
                       (SELECT COUNT(*) FROM post WHERE community_id = c.id AND post_time >= ?) as activity_score
                FROM community
                ORDER BY ?
                LIMIT 10 OFFSET ?
            `).bind(Date.now() - (24 * 60 * 60 * 1000), `activity_score ${order.toUpperCase()}`, page).all<CommunityRow>();

            return c.json(communities, { status: 200 });
        } else {
            // Existing user, is it anon?
            const anon = await env.DB.prepare(`
                SELECT is_anonymous
                FROM user
                WHERE id = ?
            `).bind(userid).first<boolean>();

            if (anon) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT COUNT(*) FROM post WHERE community_id = c.id AND post_time <= ?) as activity_score
                    FROM community
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(Date.now() - (24 * 60 * 60 * 1000), `activity_score ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM community_member WHERE community_id = c.id AND user_id = ?) as is_member,
                           (SELECT COUNT(*) FROM post WHERE community_id = c.id AND post_time <= ?) as activity_score
                    FROM community c
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(userid, Date.now() - (24 * 60 * 60 * 1000), `activity_score ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities, { status: 200 });
            }
        }
    } catch (e) {
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function createCommunity(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    // @ts-ignore
    const { name, desc, icon, tags } = c.req.valid('form');

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey, true);

        // Is user anon?
        const anon = await env.DB.prepare(`
            SELECT is_anon
            FROM user
            WHERE id = ?
        `).bind(userid).first<boolean>();

        if (anon) return c.text('Forbidden', { status: 403 });

        // First step, make sure the name is not taken
        const exists = await env.DB.prepare(
            `SELECT id
             FROM community
             WHERE name = ?`
        ).bind(name).first<CommunityRow>();

        if (exists) return c.text('Community name already taken', { status: 400 });

        // Create the community
        const community = await env.DB.prepare(
            `INSERT INTO community (name, description, icon, tags, created_at)
             VALUES (?, ?, ?, ?, ?)
             RETURNING id`
        ).bind(name, desc, icon, tags, Date.now()).first<CommunityRow>();

        // Create the roles
        // Administrator
        const adminRoleId = await env.DB.prepare(`
            INSERT INTO community_role (community_id, name, level, administrator)
            VALUES (?, 'Administrator', 100, true)
            RETURNING id
        `).bind(community!.id).first<CommunityRoleRow>();

        // Member
        await env.DB.prepare(`
            INSERT INTO community_role (community_id, name, level, read_posts, write_posts)
            VALUES (?, 'Member', 0, true, true)
            RETURNING id
        `).bind(community!.id).run();

        // Add the user as an administrator
        await env.DB.prepare(`
            INSERT INTO community_member (user_id, community_id, role_id, joined_at)
            VALUES (?, ?, ?, ?)
        `).bind(userid, community!.id, adminRoleId!.id, Date.now()).run();

        return c.json(community, { status: 201 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
