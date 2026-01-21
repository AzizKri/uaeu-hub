import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/feedback';

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
 * Submit a bug report
 */
export async function submitBugReport(description: string, screenshot?: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(`${base}/bug`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ description, screenshot }),
    });
    return request.status;
}

/**
 * Submit a feature request
 */
export async function submitFeatureRequest(description: string, screenshot?: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(`${base}/feature`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ description, screenshot }),
    });
    return request.status;
}

/**
 * Get all bug reports (admin only)
 */
export async function getBugReports(status?: string, offset: number = 0) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('offset', offset.toString());
    
    const request = await fetch(`${base}/bugs?${params.toString()}`, {
        method: 'GET',
        headers,
    });
    return await request.json();
}

/**
 * Get all feature requests (admin only)
 */
export async function getFeatureRequests(status?: string, offset: number = 0) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('offset', offset.toString());
    
    const request = await fetch(`${base}/features?${params.toString()}`, {
        method: 'GET',
        headers,
    });
    return await request.json();
}

/**
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatus(type: 'bug' | 'feature', id: number, status: string) {
    const headers = await getAuthHeaders();
    const request = await fetch(`${base}/${type}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
    });
    return request.status;
}
