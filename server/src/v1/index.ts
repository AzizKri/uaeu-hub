import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.all('*', async (c) => {
    const { pathname } = new URL(c.req.url);
    const paths: string[] = pathname.split('/').reverse();

    if (paths[paths.length - 1] === '') {
        paths.pop();
    }

    const version: string = paths.pop() || 'v1';
    const api: string = paths.pop() || 'list';
    const reqData: string[] | undefined = paths.pop()?.split('?').reverse();
    const reqType: string | undefined = reqData?.pop();
    // const params: string | undefined = reqData?.pop();

    type UserRow = {
        username: string;
        displayName: string;
        email: string;
        created_at: string;
        bio: string;
        pfp: string;
    }

    type PostRow = {
        id: number;
        author: string;
        content: string;
        post_time: number;
        displayname: string;
        pfp: string;
        like_count: number;
        comment_count: number;
    }

// API Version
    if (version === 'v1') {

        switch (api) {
            case 'list':
                return new Response('Available endpoints:\nusers\nposts\ncomments\nlikes', { status: 200 });
            case 'users':
                // Get by user ID
                if (reqType === 'get') {
                    const uname = paths.pop();
                    const result = await c.env.DB.prepare(
                        'SELECT * FROM user WHERE username = ?'
                    ).bind(uname).all<UserRow>();

                    return Response.json(result);
                }
                break;
            case 'posts':
                // Get posts
                if (reqType === 'get') {
                    const subtype = paths.pop();

                    switch (subtype) {
                        // Get last X posts
                        case 'latest': {
                            const limit: number = Number(paths.pop()) || 10;
                            const offset: number = Number(paths.pop()) || 0;
                            const result: D1Result<PostRow> = await c.env.DB.prepare(
                                `SELECT post.*,
                                        user.displayname,
                                        user.pfp,
                                        COUNT(post_likes.post_id)     AS like_count,
                                        COUNT(comment.parent_post_id) AS comment_count
                                 FROM post
                                          LEFT JOIN user ON post.author = user.username
                                          LEFT JOIN post_likes ON post.id = post_likes.post_id
                                          LEFT JOIN comment ON post.id = comment.parent_post_id
                                 GROUP BY post.id
                                 ORDER BY post.post_time DESC
                                 LIMIT ? OFFSET ?`
                            ).bind(limit, offset).all<PostRow>();

                            return Response.json(result);
                        }
                        // Get posts for user
                        case 'user': {
                            const uname = paths.pop();
                            await c.env.DB.prepare(
                                `SELECT *,
                                        COUNT(post_likes.post_id)     AS like_count,
                                        COUNT(comment.parent_post_id) AS comment_count
                                 FROM post
                                          LEFT JOIN post_likes on post.id = post_likes.post_id
                                          LEFT JOIN comment ON post.id = comment.parent_post_id
                                 WHERE author = ?
                                 GROUP BY post_likes.post_id, comment.parent_post_id
                                 ORDER BY post.post_time`
                            ).bind(uname).all<PostRow>().then((result: any) => {
                                return Response.json(result);
                            }).catch((err: Error) => {
                                return Response.json(err);
                            });
                            break;
                        }
                        default: {
                            const id = paths.pop();
                            await c.env.DB.prepare(
                                `SELECT *,
                                        COUNT(post_likes.post_id)     AS like_count,
                                        COUNT(comment.parent_post_id) AS comment_count
                                 FROM post
                                          LEFT JOIN post_likes on post.id = post_likes.post_id
                                          LEFT JOIN comment ON post.id = comment.parent_post_id
                                 WHERE id = ?
                                 GROUP BY post_likes.post_id, comment.parent_post_id
                                 ORDER BY post.post_time`
                            ).bind(id).all<PostRow>().then((result: any) => {
                                return Response.json(result);
                            }).catch((err: Error) => {
                                return Response.json(err);
                            });
                            break;
                        }
                    }
                } else if (reqType === 'post') {
                    const body: PostRow = await c.req.json();
                    const author: string | null = body?.author;
                    const content: string = body?.content;
                    await c.env.DB.prepare(
                        `INSERT INTO post (author, content)
                         VALUES (?, ?)`
                    ).bind(author, content).run().then((result: any) => {
                        return Response.json(result);
                    }).catch((err: Error) => {
                        return Response.json(err);
                    });
                }
                break;
            case 'comments':
                break;
            case 'likes':
                break;
        }
    }
});

export default app;
