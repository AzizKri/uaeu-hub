import { Context } from 'hono';

type Attachment = {
	post_id: string,
	filename: string,
	mimetype: string,
	metadata: object
}

export async function getAttachments(c: Context) {
	const env: Env = c.env;
	const postId = c.req.param('id');

	try {
		const results = await env.DB.prepare(
			`SELECT filename, mimetype, metadata
			 FROM attachment
			 WHERE post_id = ?`
		).bind(postId).all<Attachment>();

		return Response.json(results);
	} catch (e) {
		console.error(e);
		return new Response('Internal Server Error', { status: 500 });
	}
}

export async function createAttachment(c: Context) {
	const env: Env = c.env;

	// TODO Implement this

	try {
		// Uploading file to R2
		// const R2Response = await env.R2.put(filename, file.stream(), { httpMetadata: { contentType: mimetype } });
		return new Response('Not Implemented', { status: 501 });
	} catch (e) {
		console.error(e, env);
		return new Response(`Internal Server Error`, { status: 500 });
	}
}
