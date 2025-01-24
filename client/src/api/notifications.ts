const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/notification';

export async function getNotifications(page: number = 0) {
    const response = await fetch(base + `?page=${page}`, {
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
