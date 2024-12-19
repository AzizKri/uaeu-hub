import { Context } from 'hono';
import { getUserFromSessionKey } from '../util/util';

export async function comment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const postID: number = Number(formData['postid']);
    const content: string = formData['content'] as string;
    const fileName: string | null = formData['filename'] as string;
    const sessionKey = c.get('sessionKey');

    // Check for required fields
    if (!content) return c.text('No content provided', { status: 400 });

    try {
        // Get user ID from session key
        const userid = await getUserFromSessionKey(c, sessionKey);

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
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getCommentsOnPost(c: Context) {
    const env: Env = c.env;
    const postID: number = Number(c.req.param('postid'));
    const page: number = c.req.param('page') ? Number(c.req.param('page')) : 0;

    try {
        const comments = await env.DB.prepare(
            `SELECT * FROM comment_view
         WHERE post_id = ?
         ORDER BY like_count DESC
         LIMIT 10 OFFSET ?`
        ).bind(postID, page).all<CommentRow>();

        return c.json(comments, { status: 200 });
    } catch (e) {
        return c.text('Internal Server Error', { status: 500 });
    }
}
