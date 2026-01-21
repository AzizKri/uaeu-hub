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
 * Get all bug reports (admin only)
 */
export async function getBugReports(status?: string, offset: number = 0): Promise<{ reports: BugReport[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('offset', offset.toString());
    
    const response = await fetch(`${base}/bugs?${params.toString()}`, { headers });
    return await response.json();
}

/**
 * Get all feature requests (admin only)
 */
export async function getFeatureRequests(status?: string, offset: number = 0): Promise<{ requests: FeatureRequest[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('offset', offset.toString());
    
    const response = await fetch(`${base}/features?${params.toString()}`, { headers });
    return await response.json();
}

/**
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatus(
    type: 'bug' | 'feature',
    id: number,
    status: 'pending' | 'reviewed' | 'resolved' | 'closed'
): Promise<number> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/${type}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
    });
    return response.status;
}
