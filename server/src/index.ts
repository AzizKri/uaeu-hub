export default {
	async fetch(request, env): Promise<Response> {
		if (request.method === 'OPTIONS') {
			const headers = request.headers
			if (
				headers.get("Origin") != null &&
				headers.get("Access-Control-Request-Method") != null &&
				headers.get("Access-Control-Request-Headers") != null
			) {
				const respHeaders = {
					// "Access-Control-Allow-Origin": "https://sgi.uaeu.club",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET,HEAD,PUT,OPTIONS",
					"Access-Control-Max-Age": "86400",
					"Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "",
				}
				const origin = headers.get("Origin")
				if (origin != "http://localhost:5173" && origin != "http://localhost") {
					return new Response('Unauthorized', {status: 401})
				}
				return new Response(null, {
					headers: respHeaders,
				})
			} else {
				return new Response(null, {
					headers: {
						Allow: "GET, HEAD, PUT, OPTIONS",
					},
				})
			}
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
							return Response.json(result);
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
