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
