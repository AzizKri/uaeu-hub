import { Context } from 'hono';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

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
	const postId: number = Number(c.req.header('post-id'));
	const body = await c.req.parseBody();
	// @ts-ignore
	const file: File = body['file'];
	const filename: string = uuidv4();

	// Check if post ID is valid and post exists
	if (postId == 0 || isNaN(postId)) {
		return new Response('Invalid Post ID', { status: 400 });
	} else {
		const post = await env.DB.prepare(
			`SELECT id
			 FROM post
			 WHERE id = ?`
		).bind(postId).all<PostRow>();

		if (post == null) {
			return new Response('Post not found', { status: 404 });
		}
	}

	// Check if file is missing or too large
	if (!file) {
		return new Response('File missing from body', { status: 400 });
	} else if (file.size > 1024 * 1024 * 10) {
		return new Response('File too large', { status: 400 });
	}

	let R2Response: R2Object | null = null;

	try {
		// Uploading file to R2
		R2Response = await env.R2.put(`attachments/${filename}`, file.stream(), { httpMetadata: new Headers({ 'Content-Type': file.type }) });
		if (R2Response == null) {
			return new Response('Upload failed', { status: 500 });
		} else {
			await env.DB.prepare(`
				INSERT INTO attachment (post_id, filename, mimetype)
				VALUES (?, ?, ?)`
			).bind(postId, filename, file.type).run();

			return new Response('Attachment created', { status: 201, headers: { 'Location': `/attachment/${filename}` } });
		}
	} catch (e) {
		console.error(e);
		if (R2Response != null) {
			await env.R2.delete(`attachments/${filename}`);
		}
		return new Response(`Internal Server Error`, { status: 500 });
	}
}
