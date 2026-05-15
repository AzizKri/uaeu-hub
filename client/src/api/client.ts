export const apiBase = import.meta.env.VITE_API_URL || 'https://api.uaeu.chat';

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    return fetch(input, {
        ...init,
        credentials: 'include',
    });
}

export function jsonHeaders(): HeadersInit {
    return { 'Content-Type': 'application/json' };
}
