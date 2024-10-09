import {Context} from "hono";
import {HTTPException} from "hono/http-exception";

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

export async function get(c: Context) {
	// api.uaeu.chat/v2/post/:id
	const id: number | null = Number(c.req.param('id'));
	const env: Env = c.env;

	if (!id) throw new HTTPException(400, { res: new Response('No post ID defined', { status: 400 })})
	await env.DB.prepare(
		`SELECT *,
				COUNT(post_likes.post_id)     AS like_count,
				COUNT(comment.parent_post_id) AS comment_count
		 FROM post
				  LEFT JOIN post_likes on post.id = post_likes.post_id
				  LEFT JOIN comment ON post.id = comment.parent_post_id
		 WHERE id = ?
		 GROUP BY post_likes.post_id, comment.parent_post_id
		 ORDER BY post.post_time`,
	).bind(id).all<PostRow>().then((result) => Response.json(result))
		.catch((err) => {
			console.error(err);
			return new Response('Internal Server Error', {status: 500});
		});
}
