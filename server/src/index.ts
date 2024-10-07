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

			console.log(paths);

			if (paths[paths.length - 1] === '') {
				paths.pop()
			}

			const version = paths.pop();
			const api = paths.pop();
			const reqType = paths.pop();

			// API Version
			if (version === 'v1') {
				// Users API
				if (api === 'users') {
					type UserRow = {
						username: string;
						displayName: string;
						email: string;
						created_at: string;
						bio: string;
						pfp: string;
					}

					// Get by user ID
					if (reqType === 'get') {
						const uname = paths.pop();
						console.log(uname);
						const result = await env.DB.prepare(
							"SELECT * FROM users WHERE username = ?"
						).bind(uname).all<UserRow>();

						return Response.json(result);
					}
				}

				// Posts API
				if (api === 'posts') {
					type PostRow = {
						post_id: number;
						author: string;
						content: string;
						post_time: number;
						likes: number;
					}

					// Get posts
					if (reqType === 'get') {
						const subtype = paths.pop();

						// Get last X posts
						if (subtype === 'latest') {
							const limit = Number(paths.pop());
							const result = await env.DB.prepare(
								"SELECT * FROM posts ORDER BY datetime(post_time) DESC LIMIT ?"
							).bind(limit).all<PostRow>();
							return addCorsHeaders(Response.json(result), origin);
						}
					}
				}
			}

			return new Response(
				"OK",
			);
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
