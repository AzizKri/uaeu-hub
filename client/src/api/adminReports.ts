import { apiFetch } from "./client";
import { ApiMutationResult, getResponseErrorMessage, toApiMutationResult } from "./errors";

const base = import.meta.env.VITE_API_URL || "https://api.uaeu.chat";

async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    return headers;
}

export async function getAdminReports(
    offset = 0,
    includeResolved = false,
    entityType?: string,
): Promise<{ reports: AdminReport[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    params.append("offset", offset.toString());
    params.append("includeResolved", includeResolved.toString());
    if (entityType) params.append("entityType", entityType);

    const response = await apiFetch(`${base}/report/admin/all?${params.toString()}`, { headers });
    if (!response.ok) {
        throw new Error(
            await getResponseErrorMessage(response, 'Could not load reports.'),
        );
    }
    return await response.json();
}

export async function takeAdminReportAction(
    reportId: number,
    action: "delete" | "delete_suspend" | "delete_ban" | "warn" | "dismiss",
    reason?: string,
): Promise<ApiMutationResult> {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${base}/report/${reportId}/action`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, reason }),
    });

    return toApiMutationResult(
        response,
        'Could not apply the report action.',
    );
}
