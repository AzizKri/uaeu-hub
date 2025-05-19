const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/attachment';

const allowedMimeTypes = [
    // Images
    'image/jpeg',           // .jpeg, .jpg
    'image/png'            // .png
    // 'image/gif',            // .gif
    // 'image/webp',           // .webp
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
    // // Documents
    // 'application/pdf',      // .pdf
    // 'application/vnd.ms-powerpoint',    // .ppt
    // 'application/vnd.openxmlformats-officedocument.presentationml.presentation',    // .pptx
    // 'application/msword',   // .doc
    // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // .docx
    // 'application/vnd.ms-excel',    // .xls
    // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',    // .xlsx
];

// Upload attachment
export async function uploadAttachment(attachments: File[]) {
    if (!attachments[0] || !allowedMimeTypes.includes(attachments[0].type)) {
        return { status: 400 };
    }
    const formData = new FormData();
    formData.append('files[]', attachments[0]);
    formData.append('source', 'attachments');

    if (attachments[0].type.split('/')[0] === 'image') {
        const imageBitmap: ImageBitmap = await createImageBitmap(attachments[0]); // Blob file
        const { width, height } = imageBitmap;
        formData.append('width', width.toString());
        formData.append('height', height.toString());
    }

    const request = await fetch(base, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    if (request.status === 201) {
        return {
            status: 201,
            filename: await request.text()
        };
    } else {
        return { status: request.status };
    }
}

// Get attachment details by filename (length and height for images, video length, etc...)
export async function getAttachmentDetails(filename: string) {
    const request = await fetch(base + `/${filename}`, { method: 'GET' });

    return { status: request.status, data: await request.json() };
}

// Delete attachment by filename
export async function deleteAttachment(filename: string) {
    const request = await fetch(base + `/${filename}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return request.status;
}

// Upload pfp/icon
export async function uploadIcon(attachments: File, type: 'icon' | 'pfp') {
    if (!attachments || !allowedMimeTypes.includes(attachments.type)) {
        return { status: 400 };
    }
    const formData = new FormData();
    formData.append('files[]', attachments);
    formData.append('source', type);

    const request = await fetch(base, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    if (request.status === 201) {
        return {
            status: 201,
            filename: await request.text()
        };
    } else {
        return { status: request.status };
    }
}
