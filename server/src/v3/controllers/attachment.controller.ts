import { Context } from 'hono';

const allowedMimeTypes = [
    // Images
    'image/jpeg',           // .jpeg, .jpg
    'image/png',            // .png
    'image/gif',            // .gif
    'image/webp',           // .webp
    // 'image/svg+xml',        // .svg
    // 'image/bmp',            // .bmp
    // 'image/tiff',           // .tiff
    // // Videos
    // 'video/mp4',            // .mp4
    // 'video/quicktime',      // .mov
    // 'video/webm',           // .webm
    // // Audios
    // 'audio/mpeg',           // .mp3
    // 'audio/ogg',            // .ogg
    // 'audio/wav',            // .wav
    // Documents
    'application/pdf',      // .pdf
    'application/vnd.ms-powerpoint',    // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',    // .pptx
    'application/msword',   // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // .docx
    'application/vnd.ms-excel',    // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',    // .xlsx
];

export async function uploadAttachment(c: Context) {
    const env: Env = c.env;
    const formData: FormData = await c.req.formData();
    const uploadSource: string = formData.get('source') as string;
    const file: File = formData.get('files[]') as File;

    // Make sure we have a file
    if (!file) {
        return new Response('No file provided', { status: 400 });
    }

    // Deny blacklisted files
    if (!allowedMimeTypes.includes(file.type)) {
        return new Response('File type not allowed', { status: 400 });
    }

    try {
        // Create a random file name (uuidv4)
        const fileName = crypto.randomUUID();

        // Default metadata
        const metadata: AttachmentMetadata = {};

        // Image metadata
        if (file.type.split('/')[0] === 'image') {
            metadata["width"] = String(formData.get('width'));
            metadata["height"] = String(formData.get('height'));
        }

        // Upload to R2
        const R2Response = await env.R2.put(
            `${uploadSource}/${fileName}`,
            file.stream(),
            {
                httpMetadata: new Headers({ 'Content-Type': file.type }),
                customMetadata: metadata
            }
        );

        if (R2Response == null) {
            // Upload failed
            return new Response('File upload failed', { status: 500 });
        } else {
            // Upload successful, insert into DB for reference
            await env.DB.prepare(`
                INSERT INTO attachment (filename, mimetype)
                VALUES (?, ?)`
            ).bind(fileName, file.type).run();

            // Return filename
            return new Response(fileName, { status: 201 });
        }
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}

export async function getAttachmentDetails(c: Context) {
    const env: Env = c.env;
    const filename: string = c.req.param('filename');

    try {
        // Get the object details from R2
        const R2Response = await env.R2.head(`attachments/${filename}`);

        // File doesn't exist
        if (!R2Response) {
            return new Response("Object not found", { status: 404 });
        }

        const type = R2Response.httpMetadata?.contentType || '';
        // Extract custom metadata from the response headers
        const metadata = R2Response.customMetadata;

        // Return the metadata
        return c.json({ type, metadata }, { status: 200 });
    } catch (e) {
        console.log(e);
        return c.text('Internal Server Error', { status: 500 });
    }
}
