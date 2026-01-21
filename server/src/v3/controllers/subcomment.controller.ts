import { Context } from 'hono';
import { createNotification } from '../notifications';
import { createPublicId } from '../util/nanoid';

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

        // Generate public_id for the subcomment
        const publicId = createPublicId();

        let subcommentD1;
        // Check if we have a file & insert into DB
        if (fileName) {
            subcommentD1 = await env.DB.prepare(
                `INSERT INTO subcomment (parent_comment_id, author_id, content, attachment, public_id)
                 VALUES (?, ?, ?, ?, ?)
                 RETURNING id`
            ).bind(commentID, userId, content, fileName, publicId).first<SubcommentRow>();
        } else {
            subcommentD1 = await env.DB.prepare(
                `INSERT INTO subcomment (parent_comment_id, author_id, content, public_id)
                 VALUES (?, ?, ?, ?)
                 RETURNING id`
            ).bind(commentID, userId, content, publicId).first<SubcommentRow>();
        }

        const subcomment = await env.DB.prepare(`
            SELECT *
            FROM subcomment_view
            WHERE id = ?
        `).bind(subcommentD1!.id).first<SubcommentRow>();

        // Begin sending a notification but do not wait
        c.executionCtx.waitUntil(createNotification(c, {
            senderId: userId,
            type: 'subcomment',
            metadata: {
                subcommentId: subcommentD1!.id,
                parentCommentId: commentID,
                content: subcomment?.content
            }
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
    const offset: number = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

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
            ).bind(commentID, offset).all<CommentView>();

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
                                    ON sv.id = sl.subcomment_id AND sl.user_id = ?
                 WHERE parent_comment_id = ?
                 ORDER BY like_count DESC
                 LIMIT 10 OFFSET ?`
            ).bind(userId, commentID, offset).all<CommentView>();

            return c.json(subcomments.results, { status: 200 });
        }
    } catch (e) {
        console.log('error getting subComments on Comment', e);
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

    // Get optional reason from request body (for admin deletions)
    let reason: string | undefined;
    try {
        const body = await c.req.json();
        reason = body?.reason;
    } catch {
        // No body or invalid JSON is fine for regular deletions
    }

    try {
        // First fetch the subcomment to check ownership and get content
        const subcomment = await env.DB.prepare(`
            SELECT id, author_id, content, attachment FROM subcomment WHERE id = ?
        `).bind(subcommentID).first<SubcommentRow>();

        if (!subcomment) return c.text('Subcomment not found', { status: 404 });

        // Check if user is admin
        const adminCheck = await env.DB.prepare(`
            SELECT is_admin FROM user WHERE id = ?
        `).bind(userId).first<{ is_admin: number }>();
        const isAdmin = !!(adminCheck?.is_admin);

        // Not the author and not admin? 403
        if (userId !== subcomment.author_id && !isAdmin) {
            return c.text('Unauthorized', { status: 403 });
        }

        // Admin deleting someone else's subcomment? Require reason and send notification
        if (userId !== subcomment.author_id && isAdmin) {
            if (!reason || reason.trim().length === 0) {
                return c.text('Reason is required for admin deletion', { status: 400 });
            }

            // Send notification to subcomment author
            c.executionCtx.waitUntil(createNotification(c, {
                senderId: userId,
                receiverId: subcomment.author_id,
                type: 'admin_deletion',
                metadata: {
                    entityType: 'subcomment',
                    entityContent: subcomment.content,
                    reason: reason.trim()
                }
            }));
        }

        // Delete the subcomment
        await env.DB.prepare(`
            DELETE FROM subcomment WHERE id = ?
        `).bind(subcommentID).run();

        // Check for attachment and delete in the background
        if (subcomment.attachment) {
            c.executionCtx.waitUntil(Promise.all([
                    // Delete the attachment from R2
                    env.R2.delete(`attachments/${subcomment.attachment}`),

                    // Delete the attachment from the DB
                    env.DB.prepare(`
                        DELETE
                        FROM attachment
                        WHERE filename = ?
                    `).bind(subcomment.attachment).run()
                ]).then(() => console.log('Attachment deleted'))
                    .catch((e) => console.log('Attachment delete failed', e))
            );
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
                type: 'like',
                metadata: {
                    entityId: subcommentID,
                    entityType: 'subcomment'
                }
            }));

            return c.text('Subcomment liked', { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
