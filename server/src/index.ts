export default {
	async fetch(request, env): Promise<Response> {
		const { pathname } = new URL(request.url);
		const paths = pathname.split('/').reverse();

		if (paths[paths.length - 1] === '') {
			paths.pop()
		}

		const version = paths.pop();
		const api = paths.pop();
		const reqType = paths.pop();

		// API Version
		if (version === 'v1') {
			console.log(version)
			// Users API
			if (api === 'users') {
				console.log(api)
				// Get by user ID
				if (reqType === 'get') {
					console.log(reqType)
					const id = Number(paths.pop());
					if (!isNaN(id)) {
						const result = await env.DB.prepare(
							"SELECT * FROM users WHERE userid = ?"
						).bind(id).all();

						return Response.json(result);
					}
				}
			}
		}

		// if (pathname === "/api/v1/users") {
		// 	const { results } = await env.DB.prepare(
		// 		"SELECT * FROM users WHERE CompanyName = ?",
		// 	)
		// 		.bind("Bs Beverages")
		// 		.all();
		// 	return Response.json(results);
		// }

		return new Response(
			"Call /api/v1/users to see all users",
		);
	},
} satisfies ExportedHandler<Env>;
