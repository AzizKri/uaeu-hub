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
 * Get all reports with entity details
 */
export async function getReports(
    offset: number = 0,
    includeResolved: boolean = false,
    entityType?: string
): Promise<{ reports: Report[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    params.append('offset', offset.toString());
    params.append('includeResolved', includeResolved.toString());
    if (entityType) params.append('entityType', entityType);
    
    const response = await fetch(`${base}/report/admin/all?${params.toString()}`, { headers });
    return await response.json();
}

/**
 * Get a single report with full details
 */
export async function getReport(reportId: number): Promise<{ report: Report; entity: ReportEntity }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/report/${reportId}`, { headers });
    return await response.json();
}

/**
 * Take action on a report
 */
export async function takeReportAction(
    reportId: number,
    action: 'delete' | 'delete_suspend' | 'delete_ban' | 'warn' | 'dismiss',
    reason?: string
): Promise<{ message: string; status: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/report/${reportId}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, reason }),
    });
    return await response.json();
}
