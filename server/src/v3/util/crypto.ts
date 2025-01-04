const HASH_ALGORITHM = 'SHA-256';
const ITERATIONS = 100000;
const KEY_LENGTH = 32;

// Convert string to ArrayBuffer
function encodeText(text: string): ArrayBuffer {
    return new TextEncoder().encode(text);
}

// Hash a password with a salt
export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encodeText(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    const derivedKey = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: HASH_ALGORITHM,
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...new Uint8Array(derivedKey)));
}

// Generate a salt (16 bytes)
export function generateSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return { "salt": salt, "encoded": btoa(String.fromCharCode(...salt)) }
}

export async function verifyPassword(password: string, storedSalt: string, storedHash: string): Promise<boolean> {
    const salt = Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));
    const hash = await hashPassword(password, salt);
    return hash === storedHash;
}

export async function hashSessionKey(sessionKey: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodeText(sessionKey));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// export async function hashSessionKey(sessionKey: string, salt: string): Promise<string> {
//     const data = new TextEncoder().encode(sessionKey + salt);
//     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
// }

export async function validateWebSocketIdSignature(uuid: string, timestamp: string, nonce: string, signature: string, secretKey: string): Promise<boolean> {
    const computedSignature = await signWebSocketId(uuid, timestamp, nonce, secretKey);

    // Compare signatures securely to prevent timing attacks
    return computedSignature === signature;
}

async function signWebSocketId(uuid: string, timestamp: string, nonce: string, secretKey: string): Promise<string> {
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
