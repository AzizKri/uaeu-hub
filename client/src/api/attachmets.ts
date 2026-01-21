import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/attachment';

/**
 * Helper to get authorization headers with Firebase ID token
 */
async function getAuthHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    const token = await getIdToken();
    const headers: HeadersInit = {};
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

const allowedMimeTypes = [
    // Images
    'image/jpeg',           // .jpeg, .jpg
    'image/png',            // .png
    // Documents
    'application/pdf',      // .pdf
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

    const headers = await getAuthHeaders(false);
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: formData,
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
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/${filename}`, {
        method: 'DELETE',
        headers,
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

    const headers = await getAuthHeaders(false);
    const request = await fetch(base, {
        method: 'POST',
        headers,
        body: formData,
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
