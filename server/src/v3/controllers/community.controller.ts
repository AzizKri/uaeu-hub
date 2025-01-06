import { Context } from 'hono';
import { getOrCreateTags } from './tags.controller';

export async function createCommunity(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const { name, desc, icon, tags }: {
        name: string,
        desc: string,
        icon: string | null,
        tags: string[]
        // @ts-ignore
    } = c.req.valid('form');

    try {
        // First step, make sure the name is not taken
        const exists = await env.DB.prepare(
            `SELECT id
             FROM community
             WHERE name = ?`
        ).bind(name).first<CommunityRow>();

        if (exists) return c.text('Community name already taken', { status: 400 });

        // Send a request to create tags
        c.set('tags', tags);
        const tagIds = await getOrCreateTags(c, true) as number[];

        // Create the community
        const community = await env.DB.prepare(
            `INSERT INTO community (name, description, icon, tags)
             VALUES (?, ?, ?, ?)
             RETURNING id`
        ).bind(name, desc, icon || null, tags.join(',')).first<CommunityRow>();

        // Add tags to community
        await Promise.all(tagIds.map(async (tagId) => {
            await env.DB.prepare(`
                INSERT INTO community_tag (community_id, tag_id)
                VALUES (?, ?)
            `).bind(community!.id, tagId).run();
        }));

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
            INSERT INTO user_community (user_id, community_id, role_id)
            VALUES (?, ?, ?)
        `).bind(userId, community!.id, adminRoleId!.id).run();

        return c.json(community, { status: 201 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function communityExists(c: Context) {
    const env: Env = c.env;
    const name = c.req.param('name');

    // Check for required fields
    if (!name) return c.text('No community name provided', { status: 400 });

    try {
        const exists = await env.DB.prepare(`
            SELECT 1
            FROM community
            WHERE name = ?
        `).bind(name).first<CommunityRow>();

        return c.json({ exists: !!exists }, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunityByName(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const name = c.req.param('name');

    // Check for required fields
    if (!name) return c.text('No community name provided', { status: 400 });

    try {
        if (!userId) {
            // New user, get without memberships
            const community = await env.DB.prepare(`
                SELECT *
                FROM community
                WHERE name = ?
            `).bind(name).first<CommunityRow>();

            return c.json(community, { status: 200 });
        } else {
            // Existing user, is it anon?
            if (isAnonymous) {
                // Anon, get without memberships
                const community = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    WHERE name = ?
                `).bind(name).first<CommunityRow>();

                return c.json(community, { status: 200 });
            } else {
                // Get communities with membership status
                const community = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM user_community WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    WHERE c.name = ?
                `).bind(userId, name).first<CommunityRow>();

                return c.json(community, { status: 200 });
            }
        }
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunityById(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const idStr = c.req.param('id');

    // Check for required fields
    if (!idStr) return c.text('No community ID provided', { status: 400 });

    // Convert to number after checking, since 0 (General community) returns false
    const id = Number(idStr);

    try {
        if (!userId) {
            // New user, get without memberships
            const community = await env.DB.prepare(`
                SELECT *
                FROM community
                WHERE id = ?
            `).bind(id).first<CommunityRow>();

            return c.json(community, { status: 200 });
        } else {
            // Existing user, is it anon?
            if (isAnonymous) {
                // Anon, get without memberships
                const community = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    WHERE id = ?
                `).bind(id).first<CommunityRow>();

                return c.json(community, { status: 200 });
            } else {
                // Get communities with membership status
                const community = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM user_community WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    WHERE id = ?
                `).bind(userId, id).first<CommunityRow>();

                return c.json(community, { status: 200 });
            }
        }
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunitiesByTag(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const tag = c.req.query('tag');
    const page = c.req.query('page') ? Number(c.req.query('page')) : 0;

    // Check for required fields
    if (!tag) return c.text('No tag provided', { status: 400 });

    try {
        if (!userId) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *
                FROM community
                WHERE id IN (
                    SELECT community_id
                    FROM community_tag
                    WHERE tag_id = (SELECT id FROM tag WHERE name = ?)
                )
                LIMIT 10 OFFSET ?
            `).bind(tag, page * 10).all<CommunityRow>();

            return c.json(communities.results, { status: 200 });
        } else {
            // Existing user, is it anon?
            if (isAnonymous) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    WHERE id IN (
                        SELECT community_id
                        FROM community_tag
                        WHERE tag_id = (SELECT id FROM tag WHERE name = ?)
                    )
                    LIMIT 10 OFFSET ?
                `).bind(tag, page * 10).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM user_community WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    WHERE id IN (SELECT community_id
                                 FROM community_tag
                                 WHERE tag_id = (SELECT id FROM tag WHERE name = ?))
                    LIMIT 10 OFFSET ?
                `).bind(userId, tag, page * 10).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            }
        }
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunitiesSortByMembers(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const order: string = c.req.query('order') ? c.req.query('order') as string : 'desc';
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        if (!userId) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *
                FROM community
                ORDER BY ?
                LIMIT 10 OFFSET ?
            `).bind(`member_count ${order.toUpperCase()}`, page).all<CommunityRow>();

            return c.json(communities.results, { status: 200 });
        } else {
            // Existing user, is it anon?
            if (isAnonymous) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(`member_count ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM user_community WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(userId, `member_count ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            }
        }
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunitiesSortByCreation(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const order: string = c.req.query('order') ? c.req.query('order') as string : 'desc';
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        if (!userId) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *
                FROM community
                ORDER BY ?
                LIMIT 10 OFFSET ?
            `).bind(`created_at ${order.toUpperCase()}`, page).all<CommunityRow>();

            return c.json(communities.results, { status: 200 });
        } else {
            // Existing user, is it anon?
            if (isAnonymous) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(`created_at ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM user_community WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(userId, `created_at ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            }
        }
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

// TODO - Implement global activity score updates using a new table & CRON triggers
export async function getCommunitiesSortByActivity(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const order: string = c.req.query('order') ? c.req.query('order') as string : 'desc';
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        if (!userId) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *,
                       (SELECT COUNT(*) FROM post WHERE community_id = c.id AND post_time >= datetime('%s', 'now', '-1 day')) as activity_score
                FROM community
                ORDER BY ?
                LIMIT 10 OFFSET ?
            `).bind(`activity_score ${order.toUpperCase()}`, page).all<CommunityRow>();

            return c.json(communities.results, { status: 200 });
        } else {
            // Existing user, is it anon?
            if (isAnonymous) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT COUNT(*) FROM post WHERE community_id = c.id AND post_time >= datetime('%s', 'now', '-1 day')) as activity_score
                    FROM community
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(`activity_score ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM user_community WHERE community_id = c.id AND user_id = ?) as is_member,
                           (SELECT COUNT(*) FROM post WHERE community_id = c.id AND post_time >= datetime('%s', 'now', '-1 day'))   as activity_score
                    FROM community c
                    ORDER BY ?
                    LIMIT 10 OFFSET ?
                `).bind(userId, `activity_score ${order.toUpperCase()}`, page).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            }
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function searchCommunities(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const query = c.req.query('query');
    const page = c.req.query('page') ? Number(c.req.query('page')) : 0;

    // Check for required fields
    if (!query) return c.text('No query provided', { status: 400 });

    try {
        if (!userId) {
            // New user, get without memberships
            const communities = await env.DB.prepare(`
                SELECT *
                FROM community
                WHERE name LIKE ?
                LIMIT 10 OFFSET ?
            `).bind(`%${query}%`, page * 10).all<CommunityRow>();

            return c.json(communities.results, { status: 200 });
        } else {
            // Existing user, is it anon?
            if (isAnonymous) {
                // Anon, get without memberships
                const communities = await env.DB.prepare(`
                    SELECT *
                    FROM community
                    WHERE name LIKE ?
                    LIMIT 10 OFFSET ?
                `).bind(`%${query}%`, page * 10).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            } else {
                // Get communities with membership status
                const communities = await env.DB.prepare(`
                    SELECT *,
                           (SELECT 1 FROM user_community WHERE community_id = c.id AND user_id = ?) as is_member
                    FROM community c
                    WHERE name LIKE ?
                    LIMIT 10 OFFSET ?
                `).bind(userId, `%${query}%`, page * 10).all<CommunityRow>();

                return c.json(communities.results, { status: 200 });
            }
        }
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

// TODO - Redo into inviteMemberToCommunity
export async function addMemberToCommunity(c: Context) {
    return c.text('Not implemented', { status: 501 });
    // const env: Env = c.env;
    // const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    // const communityId = Number(c.req.param('id'));
    // const userId = Number(c.req.param('userId'));
    //
    // // Check for required fields
    // if (!communityId || !userId) return c.text('No community ID or user ID provided', { status: 400 });
    //
    // try {
    //     // Check if user is anonymous
    //     const user = await env.DB.prepare(`
    //         SELECT is_anonymous
    //         FROM user
    //         WHERE id = ?
    //     `).bind(userId).first<UserRow>();
    //     if (user!.is_anonymous) return c.text('Forbidden', { status: 403 });
    //
    //     // Get user ID from session key
    //     const adminFromSessionKey = await getUserFromSessionKey(c, sessionKey);
    //     if (!adminFromSessionKey || adminFromSessionKey.isAnonymous) return c.text('Unauthorized', { status: 401 });
    //
    //     // Check if the user is an administrator of the community
    //     const role = await env.DB.prepare(
    //         `SELECT 1
    //          FROM user_community
    //          WHERE user_id = ?
    //            AND community_id = ?
    //            AND role_id = (SELECT id FROM community_role WHERE community_id = ? AND administrator = true)`
    //     ).bind(adminFromSessionKey.userId, communityId, communityId).first<CommunityMemberRow>();
    //
    //     if (!role) return c.text('Unauthorized', { status: 401 });
    //
    //     // Check if the user is already a member of the community
    //     const member = await env.DB.prepare(
    //         `SELECT 1
    //          FROM user_community
    //          WHERE user_id = ?
    //            AND community_id = ?`
    //     ).bind(userId, communityId).first<CommunityMemberRow>();
    //
    //     if (member) return c.text('User is already a member of the community', { status: 400 });
    //
    //     // Add the user to the community
    //     await env.DB.prepare(`
    //         INSERT INTO user_community (user_id, community_id, role_id)
    //         VALUES (?, ?, (SELECT id FROM community_role WHERE community_id = ? AND name = 'Member'))
    //     `).bind(userId, communityId, communityId).run();
    //
    //     return c.text('User added to community', { status: 200 });
    // } catch (e) {
    //     console.log(e);
    //     return c.text('Internal Server Error', { status: 500 });
    // }
}

export async function removeMemberFromCommunity(c: Context) {
    // Get userId & isAnonymous from Context
    const adminUserId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!adminUserId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const communityId = Number(c.req.param('id'));
    const userId = Number(c.req.param('userId'));

    // Check for required fields
    if (!communityId || !userId) return c.text('No community ID or user ID provided', { status: 400 });

    try {
        // Check if the user is an administrator of the community
        const role = await env.DB.prepare(
            `SELECT 1
             FROM user_community
             WHERE user_id = ?
               AND community_id = ?
               AND role_id = (SELECT id FROM community_role WHERE community_id = ? AND administrator = true)`
        ).bind(adminUserId, communityId, communityId).first<CommunityMemberRow>();

        if (!role) return c.text('Unauthorized', { status: 401 });

        // Check if the user is a member of the community
        const member = await env.DB.prepare(
            `SELECT 1
             FROM user_community
             WHERE user_id = ?
               AND community_id = ?`
        ).bind(userId, communityId).first<CommunityMemberRow>();

        if (!member) return c.text('User is not a member of the community', { status: 400 });

        // Remove the user from the community
        await env.DB.prepare(`
            DELETE
            FROM user_community
            WHERE user_id = ?
              AND community_id = ?
        `).bind(userId, communityId).run();

        return c.text('User removed from community', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function joinCommunity(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const communityId = Number(c.req.param('id'));

    // Check for required fields
    if (!communityId) return c.text('No community ID provided', { status: 400 });

    try {
        // Check if community exists
        const community = await env.DB.prepare(`
            SELECT invite_only
            FROM community
            WHERE id = ?
        `).bind(communityId).first<CommunityRow>();
        if (!community) return c.text('Community does not exist', { status: 404 });

        // Check if the user is already a member of the community
        const member = await env.DB.prepare(`
            SELECT 1
            FROM user_community
            WHERE user_id = ?
              AND community_id = ?
        `).bind(userId, communityId).first<CommunityMemberRow>();
        if (member) return c.text('User is already a member of the community', { status: 400 });

        // Check if the community is invite-only
        if (community!.invite_only) return c.text('Community is invite-only', { status: 403 });

        // Add the user to the community
        await env.DB.prepare(`
            INSERT INTO user_community (user_id, community_id, role_id)
            VALUES (?, ?, (SELECT id FROM community_role WHERE community_id = ? AND name = 'Member'))
        `).bind(userId, communityId, communityId).run();

        return c.text('User joined community', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function leaveCommunity(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const communityId = Number(c.req.param('id'));

    // Check for required fields
    if (!communityId) return c.text('No community ID provided', { status: 400 });

    try {
        // Attempt to remove the user from the community
        const result = await env.DB.prepare(`
            DELETE
            FROM user_community
            WHERE user_id = ?
              AND community_id = ?
            RETURNING 1
        `).bind(userId, communityId).first<CommunityMemberRow>();

        // Check if the user is a member of the community
        if (!result) return c.text('User is not a member of the community', { status: 400 });

        return c.text('User left community', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function editCommunity(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const communityId = Number(c.req.param('id'));
    let { name, desc, icon, tags }: {
        name: string | null,
        desc: string | null,
        icon: string | null,
        tags: string[] | null
        // @ts-ignore
    } = c.req.valid('form');

    // Check for required fields
    if (!communityId) return c.text('No community ID provided', { status: 400 });

    try {
        // Check if community exists
        const community = await env.DB.prepare(`
            SELECT 1
            FROM community
            WHERE id = ?
        `).bind(communityId).first<CommunityRow>();
        if (!community) return c.text('Community does not exist', { status: 404 });

        // Check if the user is an administrator of the community
        const role = await env.DB.prepare(
            `SELECT 1
             FROM user_community
             WHERE user_id = ?
               AND community_id = ?
               AND role_id = (SELECT id FROM community_role WHERE community_id = ? AND administrator = true)`
        ).bind(userId, communityId, communityId).first<CommunityMemberRow>();
        if (!role) return c.text('Unauthorized', { status: 401 });

        // Check if name is taken
        if (name) {
            const exists = await env.DB.prepare(
                `SELECT 1
                 FROM community
                 WHERE name = ?`
            ).bind(name).first<CommunityRow>();
            if (exists) return c.text('Community name already taken', { status: 400 });
        }

        // Check if tags are different
        const currentTags = await env.DB.prepare(`
            SELECT tags
            FROM community
            WHERE id = ?
        `).bind(communityId).first<CommunityRow>();

        if (tags && currentTags!.tags === tags.join(',')) {
            tags = null;
        } else {
            // Get the removed tags
            const removedTags = currentTags!.tags.split(',').filter((tag) => !tags!.includes(tag));

            // Get the IDs of the removed tags
            const removedTagIds = await Promise.all(removedTags.map(async (tag) => {
                return await env.DB.prepare(`
                    SELECT id
                    FROM tag
                    WHERE name = ?
                `).bind(tag).first<TagRow>();
            }));

            // Remove the tags from the community
            await Promise.all(removedTagIds.map(async (tag) => {
                await env.DB.prepare(`
                    DELETE
                    FROM community_tag
                    WHERE community_id = ?
                      AND tag_id = ?
                `).bind(communityId, tag!.id).run();
            }));

            // Get or Create tags
            c.set('tags', tags);
            const tagIds = await getOrCreateTags(c, true) as number[];

            // Update community_tag table
            await Promise.all(tagIds.map(async (tagId) => {
                await env.DB.prepare(`
                    INSERT INTO community_tag (community_id, tag_id)
                    VALUES (?, ?)
                `).bind(communityId, tagId).run();
            }));
        }

        // Update the community
        await env.DB.prepare(`
            UPDATE community
            SET name = CASE WHEN ? IS NOT NULL THEN ? ELSE name END,
                description = CASE WHEN ? IS NOT NULL THEN ? ELSE description END,
                icon = CASE WHEN ? IS NOT NULL THEN ? ELSE icon END,
                tags = CASE WHEN ? IS NOT NULL THEN ? ELSE tags END
            WHERE id = ?
        `).bind(name, name, desc, desc, icon, icon, tags, tags, communityId).run();

        return c.text('Community updated', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function deleteCommunity(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const communityId = Number(c.req.param('id'));

    // Check for required fields
    if (!communityId) return c.text('No community ID provided', { status: 400 });

    try {
        // Check if the user is an administrator of the community
        const role = await env.DB.prepare(
            `SELECT 1
             FROM user_community
             WHERE user_id = ?
               AND community_id = ?
               AND role_id = (SELECT id FROM community_role WHERE community_id = ? AND administrator = true)`
        ).bind(userId, communityId, communityId).first<CommunityMemberRow>();

        if (!role) return c.text('Unauthorized', { status: 401 });

        // Delete the community
        await env.DB.prepare(`
            DELETE
            FROM community
            WHERE id = ?
        `).bind(communityId).run();

        return c.text('Community deleted', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommunityMembers(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const communityId = Number(c.req.param('id'));

    // Check for required fields
    if (!communityId) return c.text('No community ID provided', { status: 400 });

    try {
        // Check if the user is an administrator of the community
        const role = await env.DB.prepare(
            `SELECT 1
             FROM user_community
             WHERE user_id = ?
               AND community_id = ?
               AND role_id = (SELECT id FROM community_role WHERE community_id = ? AND administrator = true)`
        ).bind(userId, communityId, communityId).first<CommunityMemberRow>();

        if (!role) return c.text('Unauthorized', { status: 401 });

        // Get the members of the community
        const members = await env.DB.prepare(`
            SELECT u.id,
                   u.username,
                   u.display_name,
                   u.avatar,
                   u.created_at,
                   uc.joined_at,
                   cr.name as role
            FROM user_community uc
            JOIN user u ON uc.user_id = u.id
            JOIN community_role cr ON uc.role_id = cr.id
            WHERE uc.community_id = ?
        `).bind(communityId).all<CommunityMemberRow>();

        return c.json(members.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
