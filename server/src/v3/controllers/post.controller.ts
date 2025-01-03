import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getUserFromSessionKey } from '../util/util';
import { getSignedCookie } from 'hono/cookie';
import { createNotification } from '../util/notificationService';

// api.uaeu.chat/post/
export async function createPost(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const content = formData['content'] as string;
    const communityId = Number(formData['communityId']);
    const fileName: string | null = formData['filename'] as string;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Check for required fields
    if (!content) return c.text('No content defined', { status: 400 });

    // Trim excess newlines
    const trimmedContent = content.replace(/\n{3,}/g, '\n');

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey, true);

        // Check if user is in community
        if (communityId != 0) {
            console.log(userid, communityId);
            const inCommunity = await env.DB.prepare(`
                SELECT *
                FROM user_community
                WHERE user_id = ?
                  AND community_id = ?
            `).bind(userid, communityId).first();

            if (!inCommunity) return c.text('User not in community', { status: 401 });
        }

        // Check if we have a file & insert into DB
        if (fileName) {
            const postId = await env.DB.prepare(
                `INSERT INTO post (author_id, content, attachment, community_id)
                 VALUES (?, ?, ?, ?)
                 RETURNING id`
            ).bind(userid, trimmedContent, fileName, communityId || 0).first<PostView>();

            // Get the full post data to return
            const post = await env.DB.prepare(`
                SELECT *
                FROM post_view
                WHERE id = ?
            `).bind(postId!.id).first<PostView>();

            return c.json(post, { status: 201 });
        } else {
            const postId = await env.DB.prepare(
                `INSERT INTO post (author_id, content, community_id)
                 VALUES (?, ?, ?)
                 RETURNING id`
            ).bind(userid, trimmedContent, communityId || 0).first<PostView>();

            // Get the full post data to return
            const post = await env.DB.prepare(`
                SELECT *
                FROM post_view
                WHERE id = ?
            `).bind(postId!.id).first<PostView>();

            return c.json(post, { status: 201 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/latest/:page?
export async function getLatestPosts(c: Context) {
    const env: Env = c.env;
    const page = c.req.query('page') ? Number(c.req.query('page')) : 0;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            // New user, show posts without likes
            const posts = await env.DB.prepare(
                `SELECT pv.*,
                        CASE
                            WHEN tc.id IS NULL THEN NULL
                            ELSE
                                JSON_OBJECT(
                                    'id', tc.id,
                                    'author_id', tc.author_id,
                                    'author', tc.author,
                                    'pfp', tc.pfp,
                                    'displayname', tc.displayname,
                                    'content', tc.content,
                                    'post_time', tc.post_time,
                                    'attachment', tc.attachment,
                                    'like_count', tc.like_count,
                                    'comment_count', tc.comment_count
                                ) END AS top_comment
                 FROM post_view AS pv
                          LEFT JOIN (SELECT c.id,
                                            c.parent_post_id,
                                            c.author_id,
                                            c.author,
                                            c.pfp,
                                            c.displayname,
                                            c.content,
                                            c.post_time,
                                            c.attachment,
                                            c.like_count,
                                            c.comment_count
                                     FROM comment_view AS c
                                     ORDER BY c.like_count DESC, c.post_time
                                     LIMIT 1) AS tc ON tc.parent_post_id = pv.id
                 ORDER BY pv.post_time DESC
                 LIMIT 10 OFFSET ?`
            ).bind(page * 10).all<PostView>();

            return c.json(posts.results, { status: 200 });
        } else {
            // Returning user, show posts with likes
            const posts = await env.DB.prepare(
                `SELECT pv.*,
                        EXISTS (SELECT 1
                                FROM post_like
                                WHERE post_like.post_id = pv.id
                                  AND post_like.user_id = ?) AS liked,
                        CASE
                            WHEN tc.id IS NULL THEN NULL
                            ELSE
                                JSON_OBJECT(
                                    'id', tc.id,
                                    'author_id', tc.author_id,
                                    'author', tc.author,
                                    'pfp', tc.pfp,
                                    'displayname', tc.displayname,
                                    'content', tc.content,
                                    'post_time', tc.post_time,
                                    'attachment', tc.attachment,
                                    'like_count', tc.like_count,
                                    'comment_count', tc.comment_count
                                ) END                        AS top_comment
                 FROM post_view AS pv
                          LEFT JOIN (SELECT c.id,
                                            c.parent_post_id,
                                            c.author_id,
                                            c.author,
                                            c.pfp,
                                            c.displayname,
                                            c.content,
                                            c.post_time,
                                            c.attachment,
                                            c.like_count,
                                            c.comment_count
                                     FROM comment_view AS c
                                     ORDER BY c.like_count DESC, c.post_time
                                     LIMIT 1) AS tc ON tc.parent_post_id = pv.id
                 ORDER BY pv.post_time DESC
                 LIMIT 10 OFFSET ?`
            ).bind(userid, page * 10).all<PostView>();

            return c.json(posts.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/best/:page?
export async function getBestPosts(c: Context) {
    const env: Env = c.env;
    const page = c.req.query('page') ? Number(c.req.query('page')) : 0;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            // New user, show posts without likes
            const posts = await env.DB.prepare(
                `SELECT pv.*,
                        CASE
                            WHEN tc.id IS NULL THEN NULL
                            ELSE
                                JSON_OBJECT(
                                    'id', tc.id,
                                    'author_id', tc.author_id,
                                    'author', tc.author,
                                    'pfp', tc.pfp,
                                    'displayname', tc.displayname,
                                    'content', tc.content,
                                    'post_time', tc.post_time,
                                    'attachment', tc.attachment,
                                    'like_count', tc.like_count,
                                    'comment_count', tc.comment_count
                                ) END            AS top_comment,
                        (
                            (pv.like_count * 10 + pv.comment_count * 5) /
                            (1 + ((strftime('%s', 'now') - strftime('%s', datetime(pv.post_time / 1000, 'unixepoch'))) /
                                  (3600 * 24)))) AS score -- 1 day
                 FROM post_view AS pv
                          LEFT JOIN (SELECT c.id,
                                            c.parent_post_id,
                                            c.author_id,
                                            c.author,
                                            c.pfp,
                                            c.displayname,
                                            c.content,
                                            c.post_time,
                                            c.attachment,
                                            c.like_count,
                                            c.comment_count
                                     FROM comment_view AS c
                                     ORDER BY c.like_count DESC, c.post_time
                                     LIMIT 1) AS tc ON tc.parent_post_id = pv.id
                 ORDER BY score DESC
                 LIMIT 10 OFFSET ?`
            ).bind(page * 10).all<PostView>();

            return c.json(posts.results, { status: 200 });
        } else {
            // Returning user, show posts with likes
            const posts = await env.DB.prepare(
                `SELECT pv.*,
                        EXISTS (SELECT 1
                                FROM post_like
                                WHERE post_like.post_id = pv.id
                                  AND post_like.user_id = ?) AS liked,
                        CASE
                            WHEN tc.id IS NULL THEN NULL
                            ELSE
                                JSON_OBJECT(
                                    'id', tc.id,
                                    'author_id', tc.author_id,
                                    'author', tc.author,
                                    'pfp', tc.pfp,
                                    'displayname', tc.displayname,
                                    'content', tc.content,
                                    'post_time', tc.post_time,
                                    'attachment', tc.attachment,
                                    'like_count', tc.like_count,
                                    'comment_count', tc.comment_count
                                ) END                        AS top_comment,
                        (
                            (pv.like_count * 10 + pv.comment_count * 5) /
                            (1 + ((strftime('%s', 'now') - strftime('%s', datetime(pv.post_time / 1000, 'unixepoch'))) /
                                  (3600 * 24))))             AS score -- 1 day
                 FROM post_view AS pv
                          LEFT JOIN (SELECT c.id,
                                            c.parent_post_id,
                                            c.author_id,
                                            c.author,
                                            c.pfp,
                                            c.displayname,
                                            c.content,
                                            c.post_time,
                                            c.attachment,
                                            c.like_count,
                                            c.comment_count
                                     FROM comment_view AS c
                                     ORDER BY c.like_count DESC, c.post_time
                                     LIMIT 1) AS tc ON tc.parent_post_id = pv.id
                 ORDER BY score DESC
                 LIMIT 10 OFFSET ?`
            ).bind(userid, page * 10).all<PostView>();

            return c.json(posts.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getLatestPostsFromMyCommunities(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const page = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            return c.text('Unauthorized', { status: 403 });
        }

        // Get posts
        const posts = await env.DB.prepare(
            `SELECT pv.*,
                    EXISTS (SELECT 1
                            FROM post_like
                            WHERE post_like.post_id = pv.id
                              AND post_like.user_id = ?) AS liked
             FROM post_view AS pv
                      JOIN user_community AS uc ON pv.community_id = uc.community_id
             WHERE uc.user_id = ?
             ORDER BY pv.post_time DESC
             LIMIT 10 OFFSET (? * 10)`
        ).bind(userid, userid, page || 0).all<PostView>();

        return c.json(posts.results, { status: 200 });
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getBestPostsFromMyCommunities(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const page = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            return c.text('Unauthorized', { status: 403 });
        }

        // Get posts
        const posts = await env.DB.prepare(
            `SELECT pv.*,
                    EXISTS (SELECT 1
                            FROM post_like
                            WHERE post_like.post_id = pv.id
                              AND post_like.user_id = ?) AS liked,
                    (
                        (pv.like_count * 10 + pv.comment_count * 5) /
                        (1 + ((strftime('%s', 'now') - strftime('%s', datetime(pv.post_time / 1000, 'unixepoch'))) /
                              (3600 * 24)))) AS score -- 1 day
             FROM post_view AS pv
                      JOIN user_community AS uc ON pv.community_id = uc.community_id
             WHERE uc.user_id = ?
             ORDER BY score DESC
             LIMIT 10 OFFSET (? * 10)`
        ).bind(userid, userid, page || 0).all<PostView>();

        return c.json(posts.results, { status: 200 });
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/user/:username?page=0
// api.uaeu.chat/post/user/:id?page=0
export async function getPostsByUser(c: Context) {
    const env: Env = c.env;
    const { user } = c.req.param();
    const page = c.req.query('page') ? Number(c.req.query('page')) : 0;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Check for user param
    if (!user) throw new HTTPException(400, { res: new Response('No user defined', { status: 400 }) });

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            // New user, show posts without likes
            const results = await env.DB.prepare(
                `SELECT *
                 FROM post_view AS pv
                 WHERE pv.author = ?
                    OR pv.author_id = ?
                 ORDER BY pv.post_time DESC
                 LIMIT 10 OFFSET (? * 10)`
            ).bind(user, Number(user), page || 0).all<PostView>();

            return c.json(results.results, { status: 200 });
        } else {
            // Returning user, show posts with likes
            const results = await env.DB.prepare(
                `SELECT pv.*,
                        EXISTS (SELECT 1
                                FROM post_like
                                WHERE post_like.post_id = pv.id
                                  AND post_like.user_id = ?) AS liked
                 FROM post_view AS pv
                 WHERE pv.author = ?
                    OR pv.author_id = ?
                 ORDER BY pv.post_time DESC
                 LIMIT 10 OFFSET (? * 10)`
            ).bind(userid, user, Number(user), page || 0).all<PostView>();

            return c.json(results.results, { status: 200 });
        }
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/search/:query
export async function searchPosts(c: Context) {
    const env: Env = c.env;
    const query = c.req.query('query');

    // Make sure query is at least 3 characters
    if (!query || query.length < 3) return c.text('Query too short', { status: 400 });

    try {
        // Get results from FTS
        const results = await env.DB.prepare(
            `SELECT *, bm25(posts_fts, 1.0, 0.75) AS rank
             FROM post_view AS post
                      JOIN posts_fts ON post.id = posts_fts.rowid
             WHERE posts_fts MATCH ?
             ORDER BY rank DESC
             LIMIT 10`
        ).bind(query?.concat('*')).all<PostView>();

        return c.json(results.results, 200);
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/:id
export async function getPostByID(c: Context) {
    const env: Env = c.env;
    const id: number = Number(c.req.param('id'));

    // Check for post ID param
    if (!id || id == 0) return c.text('No post ID provided', { status: 400 });

    try {
        // Get post by ID
        const results = await env.DB.prepare(
            `SELECT *
             FROM post_view AS post
             WHERE post.id = ?`
        ).bind(id).all<PostView>();

        return c.json(results.results, 200);
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/:id
export async function deletePost(c: Context) {
    const env: Env = c.env;
    const postid = c.req.param('id');
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Check for post ID param
    if (!postid) return c.text('No post provided', { status: 400 });

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        // No user, definitely unauthorized
        if (!userid) return c.text('Unauthorized', { status: 403 });

        // Get the post's author
        const post = await env.DB.prepare(`
            SELECT author_id, attachment
            FROM post
            WHERE id = ?
        `).bind(postid).first<PostRow>();

        // No post? 404
        if (!post) return c.text('Post not found', { status: 404 });
        // Not the author? 403
        if (userid !== post.author_id) return c.text('Unauthorized', { status: 403 });

        if (post.attachment) {
            // Delete the attachment from R2
            await env.R2.delete(`attachments/${post.attachment}`);

            // Delete the attachment from the DB
            await env.DB.prepare(`
                DELETE
                FROM attachment
                WHERE filename = ?
            `).bind(post.attachment).run();
        }

        // Delete the post
        await env.DB.prepare(`
            DELETE
            FROM post
            WHERE id = ?
        `).bind(postid).run();

        return c.text('Post deleted', { status: 200 });
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/like/:id
export async function likePost(c: Context) {
    const env: Env = c.env;
    const postid = Number(c.req.param('id'));
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Check for post ID param
    if (!postid) return c.text('No post provided', { status: 400 });

    try {
        // Get user from session key
        const userid = await getUserFromSessionKey(c, sessionKey, true);
        if (!userid) return c.text('Internal Server Error GUFSK_NUI', { status: 500 });

        // Check if there's already a like by this user on this post
        const like = await env.DB.prepare(`
            SELECT *
            FROM post_like
            WHERE post_id = ?
              AND user_id = ?
        `).bind(postid, userid).first<PostLikeRow>();

        // If there is, remove it
        if (like) {
            await env.DB.prepare(`
                DELETE
                FROM post_like
                WHERE post_id = ?
                  AND user_id = ?
            `).bind(postid, userid).run();
        } else {
            // Not liked, add a like
            await env.DB.prepare(`
                INSERT INTO post_like (post_id, user_id)
                VALUES (?, ?)
            `).bind(postid, userid).run();

            // Create a notification
            console.log('Creating notification');
            await createNotification(c, {senderId: userid, entityId: postid, entityType: 'post', action: 'like'});
        }

        console.log('Like toggled');
        return c.text('Like toggled', { status: 200 });
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}
