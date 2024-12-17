import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSignedCookie } from 'hono/cookie';

// api.uaeu.chat/post/
export async function createPost(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const author = formData['author'] as string;
    const content = formData['content'] as string;
    const fileName: string | null = formData['filename'] as string;
    const sessionKey = c.get('sessionKey');
    console.log(sessionKey)

    if (!author) throw new HTTPException(400, { res: new Response('No author defined', { status: 400 }) });
    if (!content) throw new HTTPException(400, { res: new Response('No content defined', { status: 400 }) });

    const trimmedContent = content.replace(/\n{3,}/g, '\n');

    try {
        const userResult = await env.DB.prepare(
            `SELECT user_id FROM session WHERE id = ?`
        ).bind(sessionKey).first<SessionRow>();
        console.log(userResult);
        const userid = userResult!.user_id;
        console.log(userid);

        const authorResult = await env.DB.prepare(
            `SELECT username FROM user WHERE id = ?`
        ).bind(userid).first<UserRow>();
        const author = authorResult!.username;

        console.log(userid, author, trimmedContent);

        // We have a file
        if (fileName) {
            await env.DB.prepare(
                `INSERT INTO post (author_id, content, attachment, post_time)
                 VALUES (?, ?, ?, ?)`
            ).bind(userid, trimmedContent, fileName, Date.now()).run();
        } else {
            await env.DB.prepare(
                `INSERT INTO post (author_id, content, post_time)
                 VALUES (?, ?, ?)`
            ).bind(userid, trimmedContent, Date.now()).run();
        }

        return new Response('Post created', { status: 201 });
    } catch (e) {
        return new Response(e, { status: 500 });
    }
}

// api.uaeu.chat/post/latest/:page?
export async function getLatestPosts(c: Context) {
    const env: Env = c.env;
    const page = c.req.param('page') ? Number(c.req.param('page')) : 0;

    try {
        const posts = await env.DB.prepare(
            `SELECT * FROM post_view
         ORDER BY post_time DESC
         LIMIT 10 OFFSET ?`
        ).bind(page * 10).all<PostRow>();

        return Response.json(posts, { status: 200 });
    } catch (e) {
        return new Response('Internal Server Error', { status: 500 });
    }
}


// api.uaeu.chat/post/user/:username/:page?
// api.uaeu.chat/post/user/:id/:page?
export async function getPostsByUser(c: Context) {
    const env: Env = c.env;
    const { user, page } = c.req.param();

    if (!user) throw new HTTPException(400, { res: new Response('No user defined', { status: 400 }) });

    try {
        if (isNaN(Number(user))) {
            const results = await env.DB.prepare(
                `SELECT * FROM post_view AS post
             WHERE post.author = ?
             ORDER BY post.post_time DESC
             LIMIT 10 OFFSET (? * 10)`
            ).bind(user, page || 0).all<PostRow>();

            return Response.json(results);
        } else {
            const results = await env.DB.prepare(
                `SELECT * FROM post_view AS post
             WHERE post.author_id = ?
             ORDER BY post.post_time DESC
             LIMIT 10 OFFSET (? * 10)`
            ).bind(user, page || 0).all<PostRow>();

            return Response.json(results);
        }
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/search/:query
export async function searchPosts(c: Context) {
    const env: Env = c.env;
    const query = c.req.param('query');

    if (!query || query.length < 3) throw new HTTPException(400, { res: new Response('Query too short', { status: 400 }) });

    try {
        const results = await env.DB.prepare(
            `SELECT *, bm25(posts_fts, 1.0, 0.75) AS rank
             FROM post_view AS post
                      JOIN posts_fts ON post.id = posts_fts.rowid
             WHERE posts_fts MATCH ?
             ORDER BY rank DESC
             LIMIT 10`
        ).bind(query?.concat('*')).all<PostRow>();

        return Response.json(results);
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/:id
export async function getPostByID(c: Context) {
    const env: Env = c.env;
    const id: number = Number(c.req.param('id'));

    if (!id || id == 0) throw new HTTPException(400, { res: new Response('No post ID defined', { status: 400 }) });

    try {
        const results = await env.DB.prepare(
            `SELECT * FROM post_view AS post
             WHERE post.id = ?`
        ).bind(id).all<PostRow>();

        return Response.json(results);
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}
