export function createToken(bytes = 32): string {
    const data = new Uint8Array(bytes);
    crypto.getRandomValues(data);
    return Array.from(data, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
