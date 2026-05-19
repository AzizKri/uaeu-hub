import { Context } from 'hono';
import { createNotification } from '../notifications';
import { createPublicId } from '../util/nanoid';
import { numericIdSchema, offsetSchema } from '../util/validationSchemas';
import { validationError, validateWithSchema } from '../util/requestValidation';

export async function comment(c: Context) {
    const env: Env = c.env;
    // @ts-ignore
    const { postId: postID, content, filename } = c.req.valid('form');
    const fileName = filename ?? null;

    // Get userId from Context
    const userId = c.get('userId') as string;

    try {
        // Generate public_id for the comment
        const publicId = createPublicId();

        let commentId;
        // Check if we have a file & insert into DB
        if (fileName) {
            commentId = await env.DB.prepare(
                `INSERT INTO comment (parent_post_id, author_id, content, attachment, public_id)
                 VALUES (?, ?, ?, ?, ?)
                 RETURNING id`
            ).bind(postID, userId, content, fileName, publicId).first<CommentView>();
        } else {
            commentId = await env.DB.prepare(`
                INSERT INTO comment (parent_post_id, author_id, content, public_id)
                VALUES (?, ?, ?, ?)
                RETURNING id
            `).bind(postID, userId, content, publicId).first<CommentView>();
        }

        // Get the comment data to return
        const comment = await env.DB.prepare(`
            SELECT *
            FROM comment_view
            WHERE id = ?
        `).bind(commentId?.id).first<CommentView>();

        // Begin sending a notification but do not wait
        c.executionCtx.waitUntil(createNotification(c, {
            senderId: userId,
            type: 'comment',
            metadata: {
                commentId: commentId?.id,
                parentPostId: postID,
                content: comment?.content
            }
        }));

        return c.json(comment, { status: 201 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommentsOnPost(c: Context) {
    const env: Env = c.env;
    const params = validateWithSchema(numericIdSchema, c.req.param('postId'));
    if (!params.success) return validationError(c, params.error);

    const offsetQuery = validateWithSchema(offsetSchema, c.req.query('offset'));
    if (!offsetQuery.success) return validationError(c, offsetQuery.error);

    const postID = params.data;
    const offset = offsetQuery.data;

    // Get userId from Context
    const userId = c.get('userId') as string;

    try {
        // New user? Get without likes
        if (!userId) {
            const comments = await env.DB.prepare(
                `SELECT *
                 FROM comment_view
                 WHERE parent_post_id = ?
                 ORDER BY like_count DESC, post_time
                 LIMIT 10 OFFSET ?`
            ).bind(postID, offset).all<CommentView>();

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
                 ORDER BY like_count DESC, post_time
                 LIMIT 10 OFFSET ?`
            ).bind(userId, postID, offset).all<CommentView>();

            return c.json(comments.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function deleteComment(c: Context) {
    const env: Env = c.env;
    const parsedCommentId = validateWithSchema(numericIdSchema, c.req.param('commentId'));
    if (!parsedCommentId.success) return validationError(c, parsedCommentId.error);
    const commentId = parsedCommentId.data;

    // Get userId from Context
    const userId = c.get('userId') as string;
    if (!userId) return c.text('Unauthorized', { status: 401 });

    // Get optional reason from request body (for admin deletions)
    let reason: string | undefined;
    try {
        const body = await c.req.json();
        reason = body?.reason;
    } catch {
        // No body or invalid JSON is fine for regular deletions
    }

    try {
        // First fetch the comment to check ownership and get content
        const comment = await env.DB.prepare(`
            SELECT id, author_id, content, attachment FROM comment WHERE id = ?
        `).bind(commentId).first<CommentRow>();

        if (!comment) return c.text('Comment not found', { status: 404 });

        // Check if user is admin
        const adminCheck = await env.DB.prepare(`
            SELECT is_admin FROM user WHERE id = ?
        `).bind(userId).first<{ is_admin: number }>();
        const isAdmin = !!(adminCheck?.is_admin);

        // Not the author and not admin? 403
        if (userId !== comment.author_id && !isAdmin) {
            return c.text('Unauthorized', { status: 403 });
        }

        // Admin deleting someone else's comment? Require reason and send notification
        if (userId !== comment.author_id && isAdmin) {
            if (!reason || reason.trim().length === 0) {
                return c.text('Reason is required for admin deletion', { status: 400 });
            }

            // Send notification to comment author
            c.executionCtx.waitUntil(createNotification(c, {
                senderId: userId,
                receiverId: comment.author_id,
                type: 'admin_deletion',
                metadata: {
                    entityType: 'comment',
                    entityContent: comment.content,
                    reason: reason.trim()
                }
            }));
        }

        // Delete the comment
        await env.DB.prepare(`
            DELETE FROM comment WHERE id = ?
        `).bind(commentId).run();

        // Check for attachment and delete in the background
        if (comment.attachment) {
            c.executionCtx.waitUntil(Promise.all([
                    // Delete the attachment from R2
                    env.R2.delete(`attachments/${comment.attachment}`),

                    // Delete the attachment from the DB
                    env.DB.prepare(`
                        DELETE
                        FROM attachment
                        WHERE filename = ?
                    `).bind(comment.attachment).run()
                ]).then(() => console.log('Attachment deleted'))
                    .catch((e) => console.log('Attachment delete failed', e))
            );
        }

        return c.text('Comment deleted', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function likeComment(c: Context) {
    const env: Env = c.env;
    const parsedCommentId = validateWithSchema(numericIdSchema, c.req.param('commentId'));
    if (!parsedCommentId.success) return validationError(c, parsedCommentId.error);
    const commentId = parsedCommentId.data;

    // Get userId from Context
    const userId = c.get('userId') as string;

    try {
        // Check if the user has already liked the comment
        const like = await env.DB.prepare(
            `SELECT user_id
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

            // Send a notification but do not wait
            c.executionCtx.waitUntil(createNotification(c, {
                senderId: userId,
                type: 'like',
                metadata: {
                    entityId: commentId,
                    entityType: 'comment'
                }
            }));

            return c.text('Comment liked', { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
