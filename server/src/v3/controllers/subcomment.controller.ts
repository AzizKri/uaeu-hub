import { Context } from 'hono';
import { createNotification } from '../util/notificationService';

export async function subcomment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const commentID: number = Number(formData['commentId']);
    const content: string = formData['content'] as string;
    const fileName: string | null = formData['filename'] as string;

    // Check for required fields
    if (!content) return c.text('No content provided', { status: 400 });

    try {
        // Get user ID from Context
        const userId = c.get('userId') as number;

        let subcommentD1;
        // Check if we have a file & insert into DB
        if (fileName) {
            subcommentD1 = await env.DB.prepare(
                `INSERT INTO subcomment (parent_comment_id, author_id, content, attachment)
                 VALUES (?, ?, ?, ?)
                 RETURNING id`
            ).bind(commentID, userId, content, fileName).first<SubcommentRow>();
        } else {
            subcommentD1 = await env.DB.prepare(
                `INSERT INTO subcomment (parent_comment_id, author_id, content)
                 VALUES (?, ?, ?)
                 RETURNING id`
            ).bind(commentID, userId, content).first<SubcommentRow>();
        }

        const subcomment = await env.DB.prepare(`
            SELECT *
            FROM subcomment_view
            WHERE id = ?
        `).bind(subcommentD1!.id).first<SubcommentRow>();

        // Begin sending a notification but do not wait
        c.executionCtx.waitUntil(createNotification(c, {
            senderId: userId,
            action: 'subcomment',
            entityType: 'comment',
            entityId: subcommentD1!.id
        }));

        return c.json(subcomment, { status: 201 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getSubcommentsOnComment(c: Context) {
    // Get userId from Context
    const userId = c.get('userId') as number;

    // Get the required fields
    const env: Env = c.env;
    const commentID: number = Number(c.req.param('cid'));
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    // Check for required fields
    if (!commentID) return c.text('No comment ID provided', { status: 400 });

    try {
        // New user? Get without likes
        if (!userId) {
            const subcomments = await env.DB.prepare(
                `SELECT *
                 FROM subcomment_view
                 WHERE parent_comment_id = ?
                 ORDER BY like_count DESC
                 LIMIT 10 OFFSET ?`
            ).bind(commentID, page).all<CommentView>();

            return c.json(subcomments.results, { status: 200 });
        } else {
            // Returning user? Check if subcomments are liked
            const subcomments = await env.DB.prepare(
                `SELECT sv.*,
                        CASE
                            WHEN sl.user_id IS NOT NULL then 1
                            ELSE 0
                            END AS liked
                 FROM subcomment_view sv
                          LEFT JOIN subcomment_like sl
                                    ON sl.id = sl.subcomment_id AND sl.user_id = ?
                 WHERE parent_comment_id = ?
                 ORDER BY like_count DESC
                 LIMIT 10 OFFSET ?`
            ).bind(userId, commentID, page).all<CommentView>();

            return c.json(subcomments.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function deleteSubcomment(c: Context) {
    // Get userId from Context
    const userId = c.get('userId') as number;
    if (!userId) return c.text('Unauthorized', { status: 401 });

    // Get the required fields
    const env: Env = c.env;
    const subcommentID = Number(c.req.param('scid'));

    if (!subcommentID) return c.text('No subcomment ID provided', { status: 400 });

    try {
        // Attempt to delete the subcomment
        const result = await env.DB.prepare(
            `DELETE
             FROM subcomment
             WHERE id = ? AND author_id = ?`
        ).bind(subcommentID, userId).first<SubcommentRow>();

        if (!result) return c.text('Failed to delete subcomment', { status: 400 });

        // Check for attachment and delete in the background
        if (result.attachment) {
            c.executionCtx.waitUntil(Promise.resolve(async () => {
                try {
                    // Delete the attachment from R2
                    await env.R2.delete(`attachments/${result.attachment}`);

                    // Delete the attachment from the DB
                    await env.DB.prepare(`
                        DELETE
                        FROM attachment
                        WHERE filename = ?
                    `).bind(result.attachment).run();
                } catch (e) {
                    console.log(e);
                }
            }));
        }

        return c.text('Subcomment deleted', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function likeSubcomment(c: Context) {
    // Get userId from Context
    const userId = c.get('userId') as number;

    // Get the required fields
    const env: Env = c.env;
    const subcommentID = Number(c.req.param('scid'));

    if (!subcommentID) return c.text('No subcomment ID provided', { status: 400 });

    try {
        // Check if the user has already liked the subcomment
        const like = await env.DB.prepare(
            `SELECT *
             FROM subcomment_like
             WHERE subcomment_id = ?
               AND user_id = ?`
        ).bind(subcommentID, userId).first<PostLikeRow>();

        if (like) {
            // Unlike the subcomment
            await env.DB.prepare(
                `DELETE
                 FROM subcomment_like
                 WHERE subcomment_id = ?
                   AND user_id = ?`
            ).bind(subcommentID, userId).run();

            return c.text('Subcomment unliked', { status: 200 });
        } else {
            // Like the subcomment
            await env.DB.prepare(
                `INSERT INTO subcomment_like (subcomment_id, user_id)
                 VALUES (?, ?)`
            ).bind(subcommentID, userId).run();

            // Send a notification but do not wait
            c.executionCtx.waitUntil(createNotification(c, {
                senderId: userId,
                entityId: subcommentID,
                entityType: 'subcomment',
                action: 'like'
            }));

            return c.text('Subcomment liked', { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
