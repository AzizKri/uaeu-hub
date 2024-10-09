export default {
	async fetch(request, env): Promise<Response> {
		const origin = request.headers.get('Origin') || "";
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Max-Age': '86400' // Cache preflight response for 1 day
				}
			});
		} else {
			const { pathname } = new URL(request.url);
			const paths: string[] = pathname.split('/').reverse();

			if (paths[paths.length - 1] === '') {
				paths.pop()
			}

			const version: string = paths.pop() || "v1";
			const api: string = paths.pop() || "list";
			const reqData: string[] | undefined = paths.pop()?.split('?').reverse();
			const reqType: string | undefined = reqData?.pop();
			// const params: string | undefined = reqData?.pop();

			let resp: Response | undefined;
			let status: number;

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
						resp = new Response("Available endpoints:\nusers\nposts\ncomments\nlikes", {status: 200})
						break;
					case 'users':
						// Get by user ID
						if (reqType === 'get') {
							const uname = paths.pop();
							const result = await env.DB.prepare(
								"SELECT * FROM user WHERE username = ?"
							).bind(uname).all<UserRow>();

							resp = Response.json(result);
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
									const result: D1Result<PostRow> = await env.DB.prepare(
										`SELECT post.*, user.displayname, user.pfp,
       									COUNT(post_likes.post_id) AS like_count,
       									COUNT(comment.parent_post_id) AS comment_count
										FROM post
										LEFT JOIN user ON post.author = user.username
										LEFT JOIN post_likes ON post.id = post_likes.post_id
										LEFT JOIN comment ON post.id = comment.parent_post_id
										GROUP BY post.id
										ORDER BY post.post_time DESC
										LIMIT ? OFFSET ?`,
									).bind(limit, offset).all<PostRow>();

									resp = Response.json(result);
									break;
								}
								// Get posts for user
								case 'user': {
									const uname = paths.pop();
									await env.DB.prepare(
										`SELECT *, COUNT(post_likes.post_id) AS like_count,
									 	COUNT(comment.parent_post_id) AS comment_count
										FROM post
										LEFT JOIN post_likes on post.id = post_likes.post_id
										LEFT JOIN comment ON post.id = comment.parent_post_id
										WHERE author = ?
										GROUP BY post_likes.post_id, comment.parent_post_id
										ORDER BY post.post_time`,
									).bind(uname).all<PostRow>().then((result) => {
										resp = Response.json(result);
										status = 200;
									}).catch((err) => {
										resp = Response.json(err)
										status = 400;
									});
									break;
								}
								default: {
									const id = paths.pop();
									await env.DB.prepare(
										`SELECT *, COUNT(post_likes.post_id) AS like_count,
											COUNT(comment.parent_post_id) AS comment_count
									 FROM post
											  LEFT JOIN post_likes on post.id = post_likes.post_id
											  LEFT JOIN comment ON post.id = comment.parent_post_id
									 WHERE id = ?
									 GROUP BY post_likes.post_id, comment.parent_post_id
									 ORDER BY post.post_time`,
									).bind(id).all<PostRow>().then((result) => {
										resp = Response.json(result);
										status = 200;
									}).catch((err) => {
										resp = Response.json(err)
										status = 400;
									});
									break;
								}
							}
						}
						else if (reqType === 'post') {
							const body: PostRow = await request.json();
							const author: string | null = body?.author;
							const content: string = body?.content;
							await env.DB.prepare(
								`INSERT INTO post (author, content) VALUES (?, ?)`
							).bind(author, content).run().then((result) => {
								resp = Response.json(result);
								status = 200;
							}).catch((err) => {
								resp = Response.json(err)
								status = 400;
							});
						}
						break;
					case 'comments':
						break;
					case 'likes':
						break;
				}
			}

			return resp == undefined? new Response("OK") : addCorsHeaders(resp, origin, 200);
		}
	}
	,
} satisfies ExportedHandler<Env>;

function addCorsHeaders(response: Response, origin: string, status: number) {
	const newHeaders = new Headers(response.headers);
	newHeaders.set('Access-Control-Allow-Origin', origin);
	newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	return new Response(response.body, { ...response, headers: newHeaders, status:status });
}
