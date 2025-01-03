const base = 'http://127.0.0.1:8787';

export async function validateSignature(uuid: string, timestamp: string, nonce: string, signature: string, secretKey: string): Promise<boolean> {
    const computedSignature = await signUUID(uuid, timestamp, nonce, secretKey);

    // Compare signatures securely to prevent timing attacks
    return computedSignature === signature;
}

async function signUUID(uuid: string, timestamp: string, nonce: string, secretKey: string): Promise<string> {
    const encoder = new TextEncoder();

    // Convert the UUID and secret key to Uint8Array
    const keyData = encoder.encode(secretKey);
    const uuidData = encoder.encode(`${uuid}:${timestamp}:${nonce}`);

    // Import the secret key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
    );

    // Sign the UUID
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, uuidData);

    // Convert the signature to a URL-safe Base64 string
    return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
        .replace(/\+/g, "-") // Replace "+" with "-"
        .replace(/\//g, "_") // Replace "/" with "_"
        .replace(/=+$/, ""); // Remove "=" padding
}

export async function getUserIdFromDatabase(uuid: string): Promise<number | null> {
    const response = await fetch(`${base}/ws/${uuid}`)
    if (response.status !== 200) {
        return null;
    }
    const data = await response.json();
    return data.userId;
}
