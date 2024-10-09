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
}

export async function getByUsername(c: Context) {
	// api.uaeu.chat/v2/user/:username
	const username: string | null = c.req.param('username');
	const env: Env = c.env;

	if (!username) throw new HTTPException(400, { res: new Response('No username defined', { status: 400 })})
	await env.DB.prepare(
		"SELECT * FROM user WHERE username = ?"
	).bind(username).all<UserRow>().then((result) => {
		return Response.json(result);
	}).catch((err) => {
		console.error(err);
		return new Response('Internal Server Error', {status: 500});
	});
}
