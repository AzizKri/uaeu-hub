import { Context } from 'hono';

export async function uploadAttachment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const uploadSource: string = formData['source'] as string;
    const files: File[] = formData['files'] as File[];

    if (!files || files.length < 1) {
        return new Response('No file defined', { status: 400 });
    }

    try {
        const fileName = crypto.randomUUID();

        const R2Response = await env.R2.put(
            `${uploadSource}/${fileName}`,
            files[0].stream(),
            {
                httpMetadata: new Headers({
                    'Content-Type': files[0].type
                })
            }
        );

        if (R2Response == null) {
            return new Response('File upload failed', { status: 500 });
        } else {
            await env.DB.prepare(`
                INSERT INTO attachment (filename, mimetype)
                VALUES (?, ?)`
            ).bind(fileName, files[0].type).run();

            return new Response(fileName, { status: 201 });
        }
    } catch (e) {
        console.log(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}
