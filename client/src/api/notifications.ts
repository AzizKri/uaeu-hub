const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/notification';

export async function getNotifications(offset: number = 0) {
    const response = await fetch(base + `?offset=${offset}`, {
        credentials: 'include'
    });
    return { status: response.status, data: await response.json() };
}

export async function readNotifications() {
    const response = await fetch(base + '/read', {
        method: 'POST',
        credentials: 'include'
    });
    return { status: response.status };
}
