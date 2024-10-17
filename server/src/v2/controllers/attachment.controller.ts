import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { v4 as uuidv4 } from 'uuid';

export async function uploadAttachment(c: Context) {
    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const uploadSource = formData['source'] as string;
    const file = formData['file'] as File;

    if (!file) throw new HTTPException(400, { res: new Response('No file defined', { status: 400 }) });

    try {
        const fileName = uuidv4();

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
            // Return 500 if upload failed
            return new Response('File upload failed', { status: 500 });
        } else {
            // Insert attachment into database
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
