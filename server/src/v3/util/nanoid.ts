import { customAlphabet } from 'nanoid';

/**
 * Custom alphabet excluding ambiguous characters (0, O, l, 1, I)
 * URL-safe: a-z, A-Z, 0-9, -, _
 * Excluding: 0, O, o, l, 1, I to avoid confusion
 */
const PUBLIC_ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

/**
 * Generate a 12-character public ID
 * - URL-safe
 * - No ambiguous characters
 * - ~2.8 billion combinations (62^12 with reduced alphabet)
 * - Collision probability: extremely low
 */
const generatePublicId = customAlphabet(PUBLIC_ID_ALPHABET, 12);

/**
 * Generate a public ID for use in URLs
 * @returns A 12-character URL-safe random string
 */
export function createPublicId(): string {
    return generatePublicId();
}

/**
 * Generate a shorter public ID (8 characters)
 * Use for less critical entities or when shorter URLs are preferred
 * @returns An 8-character URL-safe random string
 */
const generateShortPublicId = customAlphabet(PUBLIC_ID_ALPHABET, 8);

export function createShortPublicId(): string {
    return generateShortPublicId();
}

/**
 * Validate that a string looks like a valid public ID
 * @param id The string to validate
 * @returns true if the string matches the public ID format
 */
export function isValidPublicId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    // Check length (8 or 12 characters)
    if (id.length !== 8 && id.length !== 12) return false;
    // Check that all characters are in our alphabet
    return [...id].every(char => PUBLIC_ID_ALPHABET.includes(char));
}
