import { Context } from 'hono';
import { getUserFromSessionKey } from '../util/util';
import { getSignedCookie } from 'hono/cookie';

export async function comment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const postID: number = Number(formData['postid']);
    const parentType: string = formData['parent-type'] as string;
    const parentLevel: number = Number(formData['parent-level']);
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
                `INSERT INTO comment (parent_post_id, parent_type, level, author_id, content, attachment)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(postID, parentType, parentLevel + 1, userid, content, fileName).run();
        } else {
            await env.DB.prepare(
                `INSERT INTO comment (parent_post_id, parent_type, level, author_id, content)
                 VALUES (?, ?, ?, ?, ?)`
            ).bind(postID, parentType, parentLevel + 1, userid, content).run();
        }

        return c.text('Comment created', { status: 201 });
    } catch (e) {
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommentsOnPost(c: Context) {
    const env: Env = c.env;
    const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    const postID: number = Number(c.req.param('postid'));
    const page: number = c.req.param('page') ? Number(c.req.param('page')) : 0;

    try {
        const userid = await getUserFromSessionKey(c, sessionKey);

        if (!userid) {
            const comments = await env.DB.prepare(
                `SELECT *
                 FROM comment_view
                 WHERE parent_post_id = ?
                 ORDER BY like_count DESC
                 LIMIT 10 OFFSET ?`
            ).bind(postID, page).all<CommentView>();

            return c.json(comments, { status: 200 });
        } else {
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

            return c.json(comments, { status: 200 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
