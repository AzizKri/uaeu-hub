import { apiFetch } from "./client";
import { ApiMutationResult, getResponseErrorMessage, toApiMutationResult } from "./errors";

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/feedback';

async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    return headers;
}

/**
 * Submit a bug report
 */
export async function submitBugReport(description: string, screenshot?: string): Promise<ApiMutationResult> {
    const headers = await getAuthHeaders();
    const request = await apiFetch(`${base}/bug`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ description, screenshot }),
    });
    return toApiMutationResult(
        request,
        'Could not submit bug report. Please review the description and try again.',
    );
}

/**
 * Submit a feature request
 */
export async function submitFeatureRequest(description: string, screenshot?: string): Promise<ApiMutationResult> {
    const headers = await getAuthHeaders();
    const request = await apiFetch(`${base}/feature`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ description, screenshot }),
    });
    return toApiMutationResult(
        request,
        'Could not submit feature request. Please review the description and try again.',
    );
}

/**
 * Get all bug reports (admin only)
 */
export async function getBugReports(
    status?: AdminFeedbackStatus,
    offset: number = 0,
): Promise<{ reports: AdminBugReport[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('offset', offset.toString());
    
    const request = await apiFetch(`${base}/bugs?${params.toString()}`, {
        method: 'GET',
        headers,
    });
    if (!request.ok) {
        throw new Error(
            await getResponseErrorMessage(
                request,
                'Could not load bug reports.',
            ),
        );
    }
    return await request.json();
}

/**
 * Get all feature requests (admin only)
 */
export async function getFeatureRequests(
    status?: AdminFeedbackStatus,
    offset: number = 0,
): Promise<{ requests: AdminFeatureRequest[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('offset', offset.toString());
    
    const request = await apiFetch(`${base}/features?${params.toString()}`, {
        method: 'GET',
        headers,
    });
    if (!request.ok) {
        throw new Error(
            await getResponseErrorMessage(
                request,
                'Could not load feature requests.',
            ),
        );
    }
    return await request.json();
}

/**
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatus(type: 'bug' | 'feature', id: number, status: AdminFeedbackStatus): Promise<ApiMutationResult> {
    const headers = await getAuthHeaders();
    const request = await apiFetch(`${base}/${type}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
    });
    return toApiMutationResult(
        request,
        `Could not update ${type === 'bug' ? 'bug report' : 'feature request'} status.`,
    );
}
