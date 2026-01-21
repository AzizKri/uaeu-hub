import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat');

/**
 * Helper to get authorization headers with Firebase ID token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getIdToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Check if an email belongs to an admin user
 */
export async function checkAdminEmail(email: string): Promise<{ isAdmin: boolean; message?: string }> {
    const response = await fetch(`${base}/auth/check-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return await response.json();
}

/**
 * Get current admin user data
 */
export async function getMe(): Promise<AdminUser | null> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/auth/me`, { headers });
    const data = await response.json();
    
    if (data.user && data.user.is_admin) {
        return {
            id: data.user.id,
            username: data.user.username,
            displayName: data.user.displayname,
            email: data.user.email,
            pfp: data.user.pfp,
            isAdmin: true,
        };
    }
    return null;
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<{ stats: AdminStats; topCommunities: TopCommunity[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/admin/stats`, { headers });
    return await response.json();
}

/**
 * Get all users (admin only)
 */
export async function getUsers(offset: number = 0, search?: string) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    params.append('offset', offset.toString());
    if (search) params.append('search', search);
    
    const response = await fetch(`${base}/admin/users?${params.toString()}`, { headers });
    return await response.json();
}

/**
 * Suspend a user
 */
export async function suspendUser(userId: number, days: number, reason: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ days, reason }),
    });
    return await response.json();
}

/**
 * Ban a user
 */
export async function banUser(userId: number, reason: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/admin/users/${userId}/ban`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
    });
    return await response.json();
}

/**
 * Unban a user
 */
export async function unbanUser(userId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/admin/users/${userId}/unban`, {
        method: 'POST',
        headers,
    });
    return await response.json();
}

/**
 * Unsuspend a user
 */
export async function unsuspendUser(userId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/admin/users/${userId}/unsuspend`, {
        method: 'POST',
        headers,
    });
    return await response.json();
}
