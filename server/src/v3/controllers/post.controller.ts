import { Context } from 'hono';
import { createNotification } from '../notifications';
import { createPublicId } from '../util/nanoid';

// api.uaeu.chat/post/
export async function createPost(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const content = formData['content'] as string;
    const communityId = Number(formData['communityId']);
    const fileName: string | null = formData['filename'] as string;

    // Check for required fields
    if (!content) return c.text('No content defined', { status: 400 });

    // Trim excess newlines
    const trimmedContent = content.replace(/\n{3,}/g, '\n');

    try {
        // Get userId & isAnon from Context
        const userId = c.get('userId') as number;
        const isAnonymous = c.get('isAnonymous') as boolean;

        // Check if user isn't anon and is in community
        if (!isAnonymous && communityId != 0) {
            console.log(userId, communityId);
            const inCommunity = await env.DB.prepare(`
                SELECT *
                FROM user_community
                WHERE user_id = ?
                  AND community_id = ?
            `).bind(userId, communityId).first();

            if (!inCommunity) return c.text('User not in community', { status: 401 });
        }

        // Generate public_id for the post
        const publicId = createPublicId();

        // Check if we have a file & insert into DB
        if (fileName) {
            const postId = await env.DB.prepare(
                `INSERT INTO post (author_id, content, attachment, community_id, public_id)
                 VALUES (?, ?, ?, ?, ?)
                 RETURNING id`
            ).bind(userId, trimmedContent, fileName, communityId || 0, publicId).first<PostView>();

            // Get the full post data to return
            const post = await env.DB.prepare(`
                SELECT *
                FROM post_view
                WHERE id = ?
            `).bind(postId!.id).first<PostView>();

            return c.json(post, { status: 201 });
        } else {
            const postId = await env.DB.prepare(
                `INSERT INTO post (author_id, content, community_id, public_id)
                 VALUES (?, ?, ?, ?)
                 RETURNING id`
            ).bind(userId, trimmedContent, communityId || 0, publicId).first<PostView>();

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

// api.uaeu.chat/post/latest/:offset?
export async function getLatestPosts(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    try {
        if (!userId || isAnonymous) {
            // New user, show posts without likes
            const posts = await env.DB.prepare(
                `SELECT pv.*
                 FROM post_view AS pv
                 ORDER BY pv.post_time DESC
                 LIMIT 10 OFFSET ?`
            ).bind(offset).all<PostView>();

            return c.json(posts.results, { status: 200 });
        } else {
            // Returning user, show posts with likes
            const posts = await env.DB.prepare(
                `SELECT pv.*,
                        EXISTS (SELECT 1
                                FROM post_like
                                WHERE post_like.post_id = pv.id
                                  AND post_like.user_id = ?) AS liked
                 FROM post_view AS pv
                 ORDER BY pv.post_time DESC
                 LIMIT 10 OFFSET ?`
            ).bind(userId, offset).all<PostView>();

            return c.json(posts.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/best/:offset?
export async function getBestPosts(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    try {
        if (!userId || isAnonymous) {
            // New user, show posts without likes
            const posts = await env.DB.prepare(
                `SELECT pv.*,
                        (
                            (pv.like_count * 10 + pv.comment_count * 5) /
                            (1 + ((strftime('%s', 'now') - strftime('%s', datetime(pv.post_time / 1000, 'unixepoch'))) /
                                  (3600 * 24)))) AS score -- 1 day
                 FROM post_view AS pv
                 ORDER BY score DESC
                 LIMIT 10 OFFSET ?`
            ).bind(offset).all<PostView>();

            return c.json(posts.results, { status: 200 });
        } else {
            // Returning user, show posts with likes
            const posts = await env.DB.prepare(
                `SELECT pv.*,
                        EXISTS (SELECT 1
                                FROM post_like
                                WHERE post_like.post_id = pv.id
                                  AND post_like.user_id = ?) AS liked,
                        (
                            (pv.like_count * 10 + pv.comment_count * 5) /
                            (1 + ((strftime('%s', 'now') - strftime('%s', datetime(pv.post_time / 1000, 'unixepoch'))) /
                                  (3600 * 24))))             AS score -- 1 day
                 FROM post_view AS pv
                 ORDER BY score DESC
                 LIMIT 10 OFFSET ?`
            ).bind(userId, offset).all<PostView>();

            return c.json(posts.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getLatestPostsFromMyCommunities(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    try {
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
             LIMIT 10 OFFSET ?`
        ).bind(userId, userId, offset).all<PostView>();

        return c.json(posts.results, { status: 200 });
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getBestPostsFromMyCommunities(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Check if user is valid and not anonymous
    if (!userId || isAnonymous) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    try {
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
                              (3600 * 24))))             AS score -- 1 day
             FROM post_view AS pv
                      JOIN user_community AS uc ON pv.community_id = uc.community_id
             WHERE uc.user_id = ?
             ORDER BY score DESC
             LIMIT 10 OFFSET ?`
        ).bind(userId, userId, offset).all<PostView>();

        return c.json(posts.results, { status: 200 });
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/user/:username?offset=0
// api.uaeu.chat/post/user/:id?offset=0
export async function getPostsByUser(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const { user } = c.req.param();
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    // Check for user param
    if (!user) return c.json([], { status: 400 });

    try {
        if (!userId || isAnonymous) {
            // New user, show posts without likes
            const results = await env.DB.prepare(
                `SELECT *
                 FROM post_view AS pv
                 WHERE pv.author = ?
                    OR pv.author_id = ?
                 ORDER BY pv.post_time DESC
                 LIMIT 10 OFFSET ?`
            ).bind(user, Number(user), offset).all<PostView>();

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
                 LIMIT 10 OFFSET ?`
            ).bind(userId, user, Number(user), offset).all<PostView>();

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
        // Sanitize and prepare FTS5 query
        // Split into terms, escape special characters, wrap in quotes, add wildcard
        const sanitizedQuery = query
            .trim()
            .split(/\s+/)
            .filter(term => term.length > 0)
            .map(term => {
                // Remove FTS5 special characters and escape double quotes
                const escaped = term
                    .replace(/[*"():^]/g, '')
                    .replace(/^(AND|OR|NOT)$/i, '');
                // Only include non-empty terms
                if (!escaped) return null;
                // Wrap in quotes for exact matching, add wildcard for prefix search
                return `"${escaped}"*`;
            })
            .filter(Boolean)
            .join(' ');

        // If no valid terms after sanitization, return empty
        if (!sanitizedQuery) {
            return c.json([], 200);
        }

        // Get results from FTS
        const results = await env.DB.prepare(
            `SELECT *, bm25(posts_fts, 1.0, 0.75) AS rank
             FROM post_view AS post
                      JOIN posts_fts ON post.id = posts_fts.rowid
             WHERE posts_fts MATCH ?
             ORDER BY rank DESC
             LIMIT 10`
        ).bind(sanitizedQuery).all<PostView>();

        return c.json(results.results, 200);
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/:id
// Supports both numeric id and public_id
export async function getPostByID(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Get the required fields
    const env: Env = c.env;
    const idParam = c.req.param('id');

    // Check for post ID param
    if (!idParam) return c.text('No post ID provided', { status: 400 });

    // Determine if this is a numeric ID or public_id
    const numericId = Number(idParam);
    const isNumeric = !isNaN(numericId) && numericId > 0;

    try {
        if (!userId || isAnonymous) {
            // New user, show posts without likes
            const results = await env.DB.prepare(
                isNumeric
                    ? `SELECT * FROM post_view AS post WHERE post.id = ?`
                    : `SELECT * FROM post_view AS post WHERE post.public_id = ?`
            ).bind(isNumeric ? numericId : idParam).all<PostView>();

            return c.json(results.results, { status: 200 });
        } else {
            // Returning user, show posts with likes
            const results = await env.DB.prepare(
                isNumeric
                    ? `SELECT post.*,
                              EXISTS (SELECT 1
                                      FROM post_like
                                      WHERE post_like.post_id = post.id
                                        AND post_like.user_id = ?) AS liked
                       FROM post_view AS post
                       WHERE post.id = ?`
                    : `SELECT post.*,
                              EXISTS (SELECT 1
                                      FROM post_like
                                      WHERE post_like.post_id = post.id
                                        AND post_like.user_id = ?) AS liked
                       FROM post_view AS post
                       WHERE post.public_id = ?`
            ).bind(userId, isNumeric ? numericId : idParam).all<PostView>();

            return c.json(results.results, 200);
        }
    } catch (e) {
        console.error(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/:id
// Supports both numeric id and public_id
export async function deletePost(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;

    // Check if user is valid
    if (!userId) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const idParam = c.req.param('id');

    // Check for post ID param
    if (!idParam) return c.text('No post provided', { status: 400 });

    // Get optional reason from request body (for admin deletions)
    let reason: string | undefined;
    try {
        const body = await c.req.json();
        reason = body?.reason;
    } catch {
        // No body or invalid JSON is fine for regular deletions
    }

    // Determine if this is a numeric ID or public_id
    const numericId = Number(idParam);
    const isNumeric = !isNaN(numericId) && numericId > 0;

    try {
        // Get the post's author and content (lookup by id or public_id)
        const post = await env.DB.prepare(
            isNumeric
                ? `SELECT id, author_id, content, attachment FROM post WHERE id = ?`
                : `SELECT id, author_id, content, attachment FROM post WHERE public_id = ?`
        ).bind(isNumeric ? numericId : idParam).first<PostRow>();

        // No post? 404
        if (!post) return c.text('Post not found', { status: 404 });

        // Check if user is admin
        const adminCheck = await env.DB.prepare(`
            SELECT is_admin FROM user WHERE id = ?
        `).bind(userId).first<{ is_admin: number }>();
        const isAdmin = !!(adminCheck?.is_admin);

        // Not the author and not admin? 403
        if (userId !== post.author_id && !isAdmin) {
            return c.text('Unauthorized', { status: 403 });
        }

        // Admin deleting someone else's post? Require reason and send notification
        if (userId !== post.author_id && isAdmin) {
            if (!reason || reason.trim().length === 0) {
                return c.text('Reason is required for admin deletion', { status: 400 });
            }

            // Send notification to post author
            c.executionCtx.waitUntil(createNotification(c, {
                senderId: userId,
                receiverId: post.author_id,
                type: 'admin_deletion',
                metadata: {
                    entityType: 'post',
                    entityContent: post.content,
                    reason: reason.trim()
                }
            }));
        }

        // Check for attachment and delete in the background
        if (post.attachment) {
            c.executionCtx.waitUntil(Promise.all([
                    // Delete the attachment from R2
                    env.R2.delete(`attachments/${post.attachment}`),

                    // Delete the attachment from the DB
                    env.DB.prepare(`
                        DELETE
                        FROM attachment
                        WHERE filename = ?
                    `).bind(post.attachment).run()
                ]).then(() => console.log('Attachment deleted'))
                    .catch((e) => console.log('Attachment delete failed', e))
            );
        }

        // Delete the post using the internal id
        await env.DB.prepare(`
            DELETE
            FROM post
            WHERE id = ?
        `).bind(post.id).run();

        return c.text('Post deleted', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/like/:id
// Supports both numeric id and public_id
export async function likePost(c: Context) {
    // Get userId & isAnonymous from Context
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    // Make sure we have a valid user
    if (!userId || isAnonymous) return c.text('Not logged in', { status: 400 });

    // Get the required fields
    const env: Env = c.env;
    const idParam = c.req.param('id');

    // Check for post ID param
    if (!idParam) return c.text('No post provided', { status: 400 });

    // Determine if this is a numeric ID or public_id
    const numericId = Number(idParam);
    const isNumeric = !isNaN(numericId) && numericId > 0;

    try {
        // Get the internal post id if public_id was provided
        let postId: number;
        if (isNumeric) {
            postId = numericId;
        } else {
            const post = await env.DB.prepare(`SELECT id FROM post WHERE public_id = ?`)
                .bind(idParam).first<{ id: number }>();
            if (!post) return c.text('Post not found', { status: 404 });
            postId = post.id;
        }

        // Check if there's already a like by this user on this post
        const like = await env.DB.prepare(`
            SELECT *
            FROM post_like
            WHERE post_id = ?
              AND user_id = ?
        `).bind(postId, userId).first<PostLikeRow>();

        // If there is, remove it
        if (like) {
            await env.DB.prepare(`
                DELETE
                FROM post_like
                WHERE post_id = ?
                  AND user_id = ?
            `).bind(postId, userId).run();
        } else {
            // Not liked, add a like
            await env.DB.prepare(`
                INSERT INTO post_like (post_id, user_id)
                VALUES (?, ?)
            `).bind(postId, userId).run();

            // Make sure the worker waits until the notification is actually sent through the websocket
            // This will still return the response without waiting though
            c.executionCtx.waitUntil(createNotification(c, {
                senderId: userId,
                type: 'like',
                metadata: {
                    entityId: postId,
                    entityType: 'post'
                }
            }));
        }

        console.log('Like toggled');
        return c.text('Like toggled', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
