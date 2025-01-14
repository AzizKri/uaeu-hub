import { Context } from 'hono';

/* User information */

export async function getCurrentUser(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;

    if (userId) {
        try {
            // Get user data
            const user = await env.DB.prepare(`
                SELECT *
                FROM user_view
                WHERE id = ?
            `).bind(userId).first<UserView>();

            // User not found...?
            if (!user) return c.json({ message: 'User not found', status: 404 }, 404);

            // User found, return it
            return c.json(user, { status: 200 });
        } catch (e) {
            console.log(e);
            return c.json({ message: 'Internal Server Error', status: 500 }, 500);
        }
    } else {
        // No user from middleware
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }
}

export async function getUserByUsername(c: Context) {
    // api.uaeu.chat/user/:username
    const env: Env = c.env;
    const username: string = c.req.param('username');

    // This is likely impossible but yeah
    if (username === '') return c.text('Bad Request', 400);

    try {
        // Get user data
        const result: UserView | null = await env.DB.prepare(
            'SELECT * FROM user_view WHERE username = ?'
        ).bind(username.toLowerCase()).first<UserView>();
        // No result found, 404
        if (!result) return c.json({ message: 'User not found', status: 404 }, 404);
        // Result found, return it
        return c.json(result, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserLikesOnPosts(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // No user or is anonymous
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    try {
        // Get user likes
        const likes = await env.DB.prepare(`
            SELECT post_id
            FROM post_like
            WHERE user_id = ?
        `).bind(userId).all<PostLikeRow>();

        return c.json(likes.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserLikesOnComments(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // No user or is anonymous
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    try {
        // Get user likes
        const likes = await env.DB.prepare(`
            SELECT comment_id
            FROM comment_like
            WHERE user_id = ?
        `).bind(userId).all<CommentLikeRow>();

        return c.json(likes.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserLikesOnSubcomments(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // No user or is anonymous
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    try {
        // Get user likes
        const likes = await env.DB.prepare(`
            SELECT subcomment_id
            FROM subcomment_like
            WHERE user_id = ?
        `).bind(userId).all<SubcommentLikeRow>();

        return c.json(likes.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserCommunities(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // No user or is anonymous
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    try {
        // Get communities
        const communities = await env.DB.prepare(`
            SELECT c.id, c.name, c.icon
            FROM community c
                     JOIN user_community cm ON c.id = cm.community_id
            WHERE cm.user_id = ?
        `).bind(userId).all<CommunityRow>();

        return c.json(communities.results, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function editUser(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // No user or is anonymous
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Parse body
    let { displayname, pfp, bio }: {
        displayname: string | null;
        bio: string | null;
        pfp: string | null;
        // @ts-ignore
    } = c.req.valid('form');

    // No changes
    if (!displayname && !bio && !pfp) return c.json({ message: 'No changes', status: 400 }, 400);

    // Update null values
    if (!displayname) displayname = null;
    if (!bio) bio = null;
    if (!pfp) pfp = null;

    try {
        // Update user
        await env.DB.prepare(`
            UPDATE user
            SET displayname = CASE WHEN ? IS NOT NULL THEN ? ELSE displayname END,
                bio         = CASE WHEN ? IS NOT NULL THEN ? ELSE bio END,
                pfp         = CASE WHEN ? IS NOT NULL THEN ? ELSE pfps END
            WHERE id = ?
        `).bind(displayname, displayname, bio, bio, pfp, pfp, userId).run();

        return c.json({ message: 'User updated', status: 200 });
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}
