import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

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

export async function getPostByID(c: Context) {
	// api.uaeu.chat/v2/post/:id
	const id: number = Number(c.req.param('id'));
	const env: Env = c.env;

	if (!id || id == 0) throw new HTTPException(400, { res: new Response('No post ID defined', { status: 400 }) });

	try {
		const results = await env.DB.prepare(
			`SELECT post.*,
							user.displayname,
							user.pfp,
							COUNT(post_likes.post_id)     AS like_count,
							COUNT(comment.parent_post_id) AS comment_count
			 FROM post
							LEFT JOIN user ON post.author = user.username
							LEFT JOIN post_likes on post.id = post_likes.post_id
							LEFT JOIN comment on post.post_time = comment.post_time
			 WHERE post.id = ?
			 GROUP BY post_likes.post_id, comment.parent_post_id
			 ORDER BY post.post_time`
		).bind(id).all<PostRow>();

		return Response.json(results);
	} catch (e) {
		console.error(e);
		return new Response('Internal Server Error', { status: 500 });
	}
}

export async function getLatestPosts(c: Context) {
	// api.uaeu.chat/v2/post/latest/:page
	const page = c.req.param('page') ? Number(c.req.param('page')) : 0;
	const env: Env = c.env;

	try {
		const results = await env.DB.prepare(
			`SELECT post.*,
							user.displayname,
							user.pfp,
							COUNT(post_likes.post_id)     AS like_count,
							COUNT(comment.parent_post_id) AS comment_count
			 FROM post
							LEFT JOIN user ON post.author = user.username
							LEFT JOIN post_likes on post.id = post_likes.post_id
							LEFT JOIN comment on post.post_time = comment.post_time
			 GROUP BY post.id
			 ORDER BY post.post_time DESC
			 LIMIT 10 OFFSET (? * 10)`
		).bind(page).all<PostRow>();

		return Response.json(results);
	} catch (e) {
		console.error(e);
		return new Response('Internal Server Error', { status: 500 });
	}
}

export async function getPostsByUser(c: Context) {
	// api.uaeu.chat/v2/post/user/:username/:page?
	const { username, page } = c.req.param();
	const env: Env = c.env;

	try {
		const results = await env.DB.prepare(
			`SELECT post.*, COUNT(post_likes.post_id) AS like_count,
							COUNT(comment.parent_post_id) AS comment_count
			 FROM post
							LEFT JOIN post_likes on post.id = post_likes.post_id
							LEFT JOIN comment ON post.id = comment.parent_post_id
			 WHERE post.author = ?
			 GROUP BY post_likes.post_id, post.id
			 ORDER BY post.post_time DESC
			 LIMIT 10 OFFSET (? * 10)`
		).bind(username, page || 0).all<PostRow>();

		return Response.json(results);
	} catch (e) {
		console.error(e);
		return new Response('Internal Server Error', { status: 500 });
	}
}

export async function createPost(c: Context) {
	// api.uaeu.chat/v2/post/create
	const env: Env = c.env;
	const body = await c.req.json();
	const author = body?.author;
	const content = body?.content;

	if (!author) throw new HTTPException(400, { res: new Response('No author defined', { status: 400 }) });
	if (!content) throw new HTTPException(400, { res: new Response('No content defined', { status: 400 }) });

	try {
		await env.DB.prepare(
			`INSERT INTO post (author, content, post_time)
			 VALUES (?, ?, ?)`
		).bind(author, content, new Date(Date.now())).run();

		return new Response('Post created', { status: 201 });
	} catch (e) {
		console.error(e);
		return new Response('Internal Server Error', { status: 500 });

	}
}
