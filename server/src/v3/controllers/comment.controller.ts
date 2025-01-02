import { Context } from 'hono';
import { getUserFromSessionKey } from '../util/util';
import { getSignedCookie } from 'hono/cookie';

export async function comment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const postID: number = Number(formData['postId']);
    const content: string = formData['content'] as string;
    const fileName: string | null = formData['filename'] as string;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Check for required fields
    if (!content) return c.text('No content provided', { status: 400 });

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey, true);

        // Check if we have a file & insert into DB
        if (fileName) {
            await env.DB.prepare(
                `INSERT INTO comment (parent_post_id, author_id, content, attachment)
                 VALUES (?, ?, ?, ?)`
            ).bind(postID, userid, content, fileName).run();
        } else {
            await env.DB.prepare(
                `INSERT INTO comment (parent_post_id, author_id, content)
                 VALUES (?, ?, ?)`
            ).bind(postID, userid, content).run();
        }

        return c.text('Comment created', { status: 201 });
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommentsOnPost(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const postID: number = Number(c.req.param('postId'));
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        // New user? Get without likes
        if (!userid) {
            const comments = await env.DB.prepare(
                `SELECT *
                 FROM comment_view
                 WHERE parent_post_id = ?
                 ORDER BY like_count DESC
                 LIMIT 10 OFFSET ?`
            ).bind(postID, page).all<CommentView>();

            return c.json(comments.results, { status: 200 });
        } else {
            // Returning user? Check if comments are liked
            const comments = await env.DB.prepare(
                `SELECT cv.*,
                        CASE
                            WHEN cl.user_id IS NOT NULL then 1
                            ELSE 0
                            END AS liked
                 FROM comment_view cv
                          LEFT JOIN comment_like cl
                                    ON cv.id = cl.comment_id AND cl.user_id = ?
                 WHERE parent_post_id = ?
                 ORDER BY like_count DESC
                 LIMIT 10 OFFSET ?`
            ).bind(userid, postID, page).all<CommentView>();

            return c.json(comments.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function deleteComment(c: Context) {
    const env: Env = c.env;
    const commentId = Number(c.req.param('commentId'));
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Check for required fields
    if (!commentId) return c.text('No comment ID provided', { status: 400 });

    try {
        // Get user ID from session key
        const userId = await getUserFromSessionKey(c, sessionKey);
        if (!userId) return c.text('Unauthorized', { status: 401 });

        // Check if the comment exists
        const comment = await env.DB.prepare(`SELECT author_id
                                              FROM comment
                                              WHERE id = ?`).bind(commentId).first<CommentRow>();
        if (!comment) return c.text('Comment not found', { status: 404 });

        // Check if the user is the author of the comment
        if (comment.author_id !== userId) return c.text('Unauthorized', { status: 401 });

        // Delete the comment
        await env.DB.prepare(`DELETE
                              FROM comment
                              WHERE id = ?`).bind(commentId).run();

        return c.text('Comment deleted', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function likeComment(c: Context) {
    const env: Env = c.env;
    const commentId = Number(c.req.param('commentId'));
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    // Check for required fields
    if (!commentId) return c.text('No comment ID provided', { status: 400 });

    try {
        // Get user ID from session key
        const userId = await getUserFromSessionKey(c, sessionKey);
        if (!userId) return c.text('Unauthorized', { status: 401 });

        // Check if the user has already liked the comment
        const like = await env.DB.prepare(
            `SELECT id
             FROM comment_like
             WHERE comment_id = ?
               AND user_id = ?`
        ).bind(commentId, userId).first<PostLikeRow>();

        if (like) {
            // Unlike the comment
            await env.DB.prepare(
                `DELETE
                 FROM comment_like
                 WHERE comment_id = ?
                   AND user_id = ?`
            ).bind(commentId, userId).run();

            return c.text('Comment unliked', { status: 200 });
        } else {
            // Like the comment
            await env.DB.prepare(`
                INSERT INTO comment_like (comment_id, user_id)
                VALUES (?, ?)`
            ).bind(commentId, userId).run();

            return c.text('Comment liked', { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
