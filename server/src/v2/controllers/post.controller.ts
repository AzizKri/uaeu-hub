import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

/** GET Requests **/

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
        ).bind(query?.concat('*')).all<PostRowV2>();

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
        ).bind(id).all<PostRowV2>();

        return Response.json(results);
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/best/:page
// export async function getBestPosts(c: Context) {
// 	const env: Env = c.env;
// 	const page = c.req.param('page') ? Number(c.req.param('page')) : 0;
//
// 	try {
// 		const results = await env.DB.prepare(
// 			`SELECT post.*,
// 							user.displayname,
// 							user.pfp,
// 							COUNT(post_likes.post_id)     AS like_count,
// 							COUNT(comment.parent_post_id) AS comment_count,
// 				 (
// 				 (COUNT(post_likes.post_id) / (SELECT MAX(like_count) FROM post)) * 0.5 +
// 				 (COUNT(comment.parent_post_id) / (SELECT MAX(comment_count) FROM post)) * 0.35 -
// 				 (post.post_time / (SELECT MAX(like_count) FROM post)) * 0.15
// 				 )
// 			 FROM post
// 				 LEFT JOIN user
// 			 ON post.author = user.username
// 				 LEFT JOIN post_likes on post.id = post_likes.post_id
// 				 LEFT JOIN comment on post.post_time = comment.post_time
// 			 GROUP BY post_likes.post_id, post.id
// 			 ORDER BY post.post_time DESC
// 			 LIMIT 10 OFFSET (? * 10)`
// 		).bind(page).all<PostRowV2>();
//
// 		return Response.json(results);
// 	} catch (e) {
// 		console.error(e);
// 		return new Response('Internal Server Error', { status: 500 });
// 	}
// }

// api.uaeu.chat/post/latest/:page
export async function getLatestPosts(c: Context) {
    const env: Env = c.env;
    const ipAddress: string = c.req.header('cf-connecting-ip') || "";
    const { success } = await env.POSTS_RL.limit({ key: `getLatest_${ipAddress}`})
    if (!success) {
        return c.json({ success: false, message: 'Rate limit exceeded', status: 429, results: [] }, 429);
    }
    const page = c.req.param('page') ? Number(c.req.param('page')) : 0;

    try {
        const results = await env.DB.prepare(
            `SELECT * FROM post_view AS post
             ORDER BY post.post_time DESC
             LIMIT 10 OFFSET (? * 10)`
        ).bind(page).all<PostRowV2>();

        return Response.json(results);
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// api.uaeu.chat/post/user/:username/:page?
// api.uaeu.chat/post/user/:id/:page?
export async function getPostsByUser(c: Context) {
    const env: Env = c.env;
    const { user, page } = c.req.param();

    if (!user) throw new HTTPException(400, { res: new Response('No username defined', { status: 400 }) });

    try {
        if (isNaN(Number(user))) {
            const results = await env.DB.prepare(
                `SELECT * FROM post_view AS post
             WHERE post.author = ?
             ORDER BY post.post_time DESC
             LIMIT 10 OFFSET (? * 10)`
            ).bind(user, page || 0).all<PostRowV2>();

            return Response.json(results);
        } else {
            const results = await env.DB.prepare(
                `SELECT * FROM post_view AS post
             WHERE post.author_id = ?
             ORDER BY post.post_time DESC
             LIMIT 10 OFFSET (? * 10)`
            ).bind(user, page || 0).all<PostRowV2>();

            return Response.json(results);
        }
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}

/** POST Requests **/

// api.uaeu.chat/post/create
// export async function createPostOld(c: Context) {
//     const env: Env = c.env;
//     const formData = await c.req.parseBody();
//     const author = formData['author'] as string;
//     const content = formData['content'] as string;
//     const file: File | undefined = formData['file'] as File;
//
//     if (!author) throw new HTTPException(400, { res: new Response('No author defined', { status: 400 }) });
//     if (!content) throw new HTTPException(400, { res: new Response('No content defined', { status: 400 }) });
//
//     try {
//         // Initialize attachment name
//         let attName: string | null = null;
//
//         // Check if we have an attachment
//         if (file) {
//             // Generate a random name
//             attName = crypto.randomUUID();
//
//             // Check if file size > 10MB
//             if (file.size > 1024 * 1024 * 10) {
//                 return new Response('File too large', { status: 400 });
//             }
//
//             try {
//                 // Upload file to R2
//                 const R2Response = await env.R2.put(
//                     `attachments/${attName}`,
//                     file.stream(),
//                     {
//                         httpMetadata: new Headers({
//                             'Content-Type': file.type
//                         })
//                     }
//                 );
//
//                 if (R2Response == null) {
//                     // Return 500 if upload failed
//                     return new Response('File upload failed', { status: 500 });
//                 } else {
//                     // Insert attachment into database
//                     await env.DB.prepare(`
//                         INSERT INTO attachment (filename, mimetype)
//                         VALUES (?, ?)`
//                     ).bind(attName, file.type).run();
//
//                     // Create a new post with attachment
//                     await env.DB.prepare(
//                         `INSERT INTO post (author, content, post_time, attachment)
//                          VALUES (?, ?, ?, ?)`
//                     ).bind(author, content, Date.now(), attName).run();
//
//                     return new Response('Post created', { status: 201 });
//                 }
//             } catch (e) {
//                 console.error(e);
//                 return new Response(`Internal Server Error`, { status: 500 });
//             }
//         }
//
//         // No file, create post without attachment
//         await env.DB.prepare(
//             `INSERT INTO post (author, content, post_time)
//              VALUES (?, ?, ?)`
//         ).bind(author, content, Date.now()).run();
//
//         return new Response('Post created', { status: 201 });
//     } catch (e) {
//         console.error(e);
//         return new Response('Internal Server Error', { status: 500 });
//
//     }
// }

// api.uaeu.chat/post
export async function createPost(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const author = formData['author'] as string;
    const title = formData['title'] as string;
    const content = formData['content'] as string;
    const fileName: string | null = formData['filename'] as string;

    if (!author) throw new HTTPException(400, { res: new Response('No author defined', { status: 400 }) });
    if (!title) throw new HTTPException(400, { res: new Response('No title defined', { status: 400 }) });
    if (!content) throw new HTTPException(400, { res: new Response('No content defined', { status: 400 }) });

    const trimmedContent = content.replace(/\n{3,}/g, '\n');

    try {
        // We have a file
        if (fileName) {
            await env.DB.prepare(
                `INSERT INTO post (author_id, title, content, attachment, post_time)
                 VALUES (?, ?, ?, ?, ?)`
            ).bind(author, title, trimmedContent, fileName, Date.now()).run();
        } else {
            await env.DB.prepare(
                `INSERT INTO post (author_id, title, content, post_time)
                 VALUES (?, ?, ?, ?)`
            ).bind(author, title, trimmedContent, Date.now()).run();
        }

        return new Response('Post created', { status: 201 });
    } catch (e) {
        console.error(e);
        return new Response('Internal Server Error', { status: 500 });

    }
}

// api.uaeu.chat/post/like
export async function likePost(c: Context) {
    // const env: Env = c.env;
    // const { postId, userid } = await c.req.json();
    // TODO Implement likes
}
