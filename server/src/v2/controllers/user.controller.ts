import {Context} from "hono";
import {HTTPException} from "hono/http-exception";

type UserRow = {
	username: string;
	displayName: string;
	email: string;
	created_at: string;
	bio: string;
	pfp: string;
}

export async function Authenticate(c: Context) {
	// api.uaeu.chat/v2/user/authenticate
	console.log(c);
	return new Response('Not implemented', {status: 501});
	// TODO: Implement authentication
}

export async function getByUsername(c: Context) {
	// api.uaeu.chat/v2/user/:username
	const env: Env = c.env;
	const username = c.req.param('username');

	// This is likely impossible but yeah
	if (username === '') throw new HTTPException(400, { res: new Response('No username defined', { status: 400 })})

	try {
		const result = await env.DB.prepare(
			"SELECT * FROM user WHERE username = ?"
		).bind(username).all<UserRow>();
		return Response.json(result);
	} catch (e) {
		console.log(e);
		return new Response('Internal Server Error', {status: 500});
	}
}
