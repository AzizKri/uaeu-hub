import { Context } from 'hono';

export async function uploadAttachment(c: Context) {
    const env: Env = c.env;
    const formData: FormData = await c.req.formData();
    const uploadSource: string = formData.get('source') as string;
    const file: File = formData.get('files[]') as File;

    if (!file) {
        return new Response('No file provided', { status: 400 });
    }

    try {
        const fileName = crypto.randomUUID();

        const R2Response = await env.R2.put(
            `${uploadSource}/${fileName}`,
            file.stream(),
            {
                httpMetadata: new Headers({
                    'Content-Type': file.type
                })
            }
        );

        if (R2Response == null) {
            return new Response('File upload failed', { status: 500 });
        } else {
            await env.DB.prepare(`
                INSERT INTO attachment (filename, mimetype)
                VALUES (?, ?)`
            ).bind(fileName, file.type).run();

            return new Response(fileName, { status: 201 });
        }
    } catch (e) {
        console.log(e);
        return new Response('Internal Server Error', { status: 500 });
    }
}
