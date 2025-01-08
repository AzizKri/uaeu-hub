import {base} from "./api.ts";

export async function createWebsocketConnection() {
    console.log("createWebsocketConnection");
    // Generate the UUID
    const uuid = crypto.randomUUID();

    // Sign the UUID & get timestamp, nonce, and signed URL
    const { signedURL, timestamp, nonce, signature } = await signUUID(uuid, import.meta.env.VITE_WS_SECRET_KEY);

    // Send entry to DB
    const wsEntry = await createWebSocketEntryInDatabase(uuid, timestamp, nonce, signature);

    // Check if successful
    if (wsEntry.status !== 200) {
        return null;
    }

    // Return the WebSocket connection
    try {
        return new WebSocket(import.meta.env.VITE_WS_URL + signedURL)
    } catch (e) {
        console.error('Failed to create WebSocket connection:', e);
        await deleteWebSocketEntryFromDatabase(uuid);
        return null;
    }
}

// Create a new entry in the database for the WebSocket connection
async function createWebSocketEntryInDatabase(uuid: string, timestamp: number, nonce: string, signature: string) {
    const formData = new FormData();
    formData.append('uuid', uuid);
    formData.append('timestamp', timestamp.toString());
    formData.append('nonce', nonce);
    formData.append('signature', signature);

    return await fetch(base + `/ws`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
}

// Delete the WebSocket entry from the database (in case of failed connections)
export async function deleteWebSocketEntryFromDatabase(uuid: string) {
    return await fetch(base + `/ws/${uuid}`, {
        method: 'DELETE',
        credentials: 'include'
    });
}

// Sign the UUID with the secret key
async function signUUID(uuid: string, secretKey: string): Promise<{ signedURL: string, timestamp: number, nonce: string, signature: string }> {
    const encoder = new TextEncoder();

    // Generate a timestamp and nonce
    const timestamp = Date.now();
    const nonce = crypto.randomUUID(); // For replay protection, we love security

    // Prepare data
    const dataToSign = `${uuid}:${timestamp}:${nonce}`;
    // This is our identifier
    const data = encoder.encode(dataToSign);
    // This is the secret key
    const keyData = encoder.encode(secretKey);

    // Import the secret key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
    );

    // Sign the UUID
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);

    // Convert the signature to a URL-safe Base64 string
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
        .replace(/\+/g, "-") // Replace "+" with "-"
        .replace(/\//g, "_") // Replace "/" with "_"
        .replace(/=+$/, ""); // Remove "=" padding

    // Create our signed URL
    const signedURL = `/?uuid=${encodeURIComponent(uuid)}&timestamp=${timestamp}&nonce=${nonce}&signature=${encodeURIComponent(signature)}`;
    return { signedURL, timestamp, nonce, signature }
}
