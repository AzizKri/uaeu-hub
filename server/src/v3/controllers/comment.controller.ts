import { Context } from 'hono';
import { createNotification } from '../notifications';

export async function comment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const postID: number = Number(formData['postId']);
    const content: string = formData['content'] as string;
    const fileName: string | null = formData['filename'] as string;

    // Get userId from Context
    const userId = c.get('userId') as number;

    // Check for required fields
    if (!content) return c.text('No content provided', { status: 400 });

    try {
        let commentId;
        // Check if we have a file & insert into DB
        if (fileName) {
            commentId = await env.DB.prepare(
                `INSERT INTO comment (parent_post_id, author_id, content, attachment)
                 VALUES (?, ?, ?, ?)
                 RETURNING id`
            ).bind(postID, userId, content, fileName).first<CommentView>();
        } else {
            commentId = await env.DB.prepare(`
                INSERT INTO comment (parent_post_id, author_id, content)
                VALUES (?, ?, ?)
                RETURNING id
            `).bind(postID, userId, content).first<CommentView>();
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
            action: 'comment',
            entityData: {
                entityType: 'comment',
                entityId: commentId?.id
            },
            parentEntityData: {
                entityType: 'post',
                entityId: postID
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
    const postID: number = Number(c.req.param('postId'));
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    // Get userId from Context
    const userId = c.get('userId') as number;

    try {
        // New user? Get without likes
        if (!userId) {
            const comments = await env.DB.prepare(
                `SELECT *
                 FROM comment_view
                 WHERE parent_post_id = ?
                 ORDER BY like_count DESC, post_time
                 LIMIT 10 OFFSET ?`
            ).bind(postID, page * 10).all<CommentView>();

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
            ).bind(userId, postID, page * 10).all<CommentView>();

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

    // Get userId from Context
    const userId = c.get('userId') as number;
    if (!userId) return c.text('Unauthorized', { status: 401 });

    // Check for required fields
    if (!commentId) return c.text('No comment ID provided', { status: 400 });

    try {
        // Attempt to delete the comment
        const result = await env.DB.prepare(`
            DELETE
            FROM comment
            WHERE id = ?
              AND author_id = ?
        `).bind(commentId, userId).first<CommentView>();

        if (!result) return c.text('Failed to delete comment', { status: 400 });

        // Check for attachment and delete in the background
        if (result.attachment) {
            c.executionCtx.waitUntil(Promise.all([
                    // Delete the attachment from R2
                    env.R2.delete(`attachments/${result.attachment}`),

                    // Delete the attachment from the DB
                    env.DB.prepare(`
                        DELETE
                        FROM attachment
                        WHERE filename = ?
                    `).bind(result.attachment).run()
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
    const commentId = Number(c.req.param('commentId'));

    // Get userId from Context
    const userId = c.get('userId') as number;

    // Check for required fields
    if (!commentId) return c.text('No comment ID provided', { status: 400 });

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
                action: 'like',
                entityData: {
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
