import { Context } from 'hono';
import { getUserFromSessionKey } from '../util/util';
import { getSignedCookie } from 'hono/cookie';

export async function subcomment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const commentID: number = Number(formData['commentId']);
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
                `INSERT INTO subcomment (parent_comment_id, author_id, content, attachment)
                 VALUES (?, ?, ?, ?)`
            ).bind(commentID, userid, content, fileName).run();
        } else {
            await env.DB.prepare(
                `INSERT INTO subcomment (parent_comment_id, author_id, content)
                 VALUES (?, ?, ?)`
            ).bind(commentID, userid, content).run();
        }

        return c.text('Comment created', { status: 201 });
    } catch (e) {
        console.log(e)
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getSubcommentsOnComment(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const commentID: number = Number(c.req.param('cid'));
    const page: number = c.req.query('page') ? Number(c.req.query('page')) : 0;

    // Check for required fields
    if (!commentID) return c.text('No comment ID provided', { status: 400 });

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

        // New user? Get without likes
        if (!userid) {
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
            ).bind(userid, commentID, page).all<CommentView>();

            return c.json(subcomments.results, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function deleteSubcomment(c: Context) {
    const env: Env = c.env;
    const subcommentID = Number(c.req.param('scid'));
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    if (!subcommentID) return c.text('No subcomment ID provided', { status: 400 });

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey, true);

        // Check if subcomment exists & user is the author of the subcomment
        const subcomment = await env.DB.prepare(
            `SELECT author_id
             FROM subcomment
             WHERE id = ?`
        ).bind(subcommentID).first<SubcommentRow>();

        if (!subcomment || subcomment.author_id !== userid) {
            return c.text('Unauthorized', { status: 401 });
        }

        await env.DB.prepare(
            `DELETE
             FROM subcomment
             WHERE id = ?`
        ).bind(subcommentID).run();

        return c.text('Subcomment deleted', { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function likeSubcomment(c: Context) {
    const env: Env = c.env;
    const subcommentID = Number(c.req.param('scid'));
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;

    if (!subcommentID) return c.text('No subcomment ID provided', { status: 400 });

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey, true);

        // Check if the user has already liked the subcomment
        const like = await env.DB.prepare(
            `SELECT *
             FROM subcomment_like
             WHERE subcomment_id = ?
               AND user_id = ?`
        ).bind(subcommentID, userid).first<PostLikeRow>();

        if (like) {
            // Unlike the subcomment
            await env.DB.prepare(
                `DELETE
                 FROM subcomment_like
                 WHERE subcomment_id = ?
                   AND user_id = ?`
            ).bind(subcommentID, userid).run();

            return c.text('Subcomment unliked', { status: 200 });
        } else {
            // Like the subcomment
            await env.DB.prepare(
                `INSERT INTO subcomment_like (subcomment_id, user_id)
                 VALUES (?, ?)`
            ).bind(subcommentID, userid).run();

            return c.text('Subcomment liked', { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
