import {base} from "./api.ts";

// Get All Tags
export async function getTags() {
    const request = await fetch(base + `/tags`, {
        method: 'GET'
    });
    return { status: request.status, data: await request.json() };
}

