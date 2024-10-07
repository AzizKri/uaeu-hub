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
			const {pathname} = new URL(request.url);
			const paths = pathname.split('/').reverse();

			if (paths[paths.length - 1] === '') {
				paths.pop()
			}

			const version = paths.pop();
			const api = paths.pop();
			const reqType = paths.pop();

			let resp: Response | undefined;

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
			}

			// API Version
			if (version === 'v1') {
				// Users API
				if (api === 'users') {

					// Get by user ID
					if (reqType === 'get') {
						const uname = paths.pop();
						const result = await env.DB.prepare(
							"SELECT * FROM users WHERE username = ?"
						).bind(uname).all<UserRow>();

						resp = Response.json(result);
					}
				}

				// Posts API
				if (api === 'posts') {

					// Get posts
					if (reqType === 'get') {
						const subtype = paths.pop();

						// Get last X posts
						switch (subtype) {
							case 'latest': {
								const limit = Number(paths.pop());
								const result = await env.DB.prepare(
									`SELECT posts.*, users.displayname, users.pfp, COUNT(post_likes.post_id) AS like_count
										FROM posts
										LEFT JOIN users ON posts.author = users.username
										LEFT JOIN post_likes on posts.id = post_likes.post_id
										GROUP BY posts.id
										ORDER BY posts.post_time DESC LIMIT ?`,
								).bind(limit).all<PostRow>();

								resp = Response.json(result);
								break;
							}
							case 'user': {
								const uname = paths.pop();
								const result = await env.DB.prepare(
									`SELECT *, COUNT(post_likes.post_id) AS like_count
										FROM posts
										LEFT JOIN post_likes on posts.id = post_likes.post_id
										WHERE author = ?
										GROUP BY post_likes.post_id
										ORDER BY posts.post_time`,
								).bind(uname).all<PostRow>();

								resp = Response.json(result);
								break;
							}
							default: {
								const id = paths.pop();
								const result = await env.DB.prepare(
									"SELECT * FROM posts WHERE id = ?",
								).bind(id).all<PostRow>();

								resp = Response.json(result);
								break;
							}
						}
					}
				}
			}

			return resp == undefined? new Response("OK") : addCorsHeaders(resp, origin);
		}
	}
	,
} satisfies ExportedHandler<Env>;

function addCorsHeaders(response: Response, origin: string) {
	const newHeaders = new Headers(response.headers);
	newHeaders.set('Access-Control-Allow-Origin', origin);
	newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	return new Response(response.body, { ...response, headers: newHeaders });
}
