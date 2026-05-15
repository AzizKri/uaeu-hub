import { getIdToken } from "../firebase/config.ts";

const base = import.meta.env.VITE_API_URL || "https://api.uaeu.chat";

async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getIdToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

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

    const response = await fetch(`${base}/report/admin/all?${params.toString()}`, { headers });
    return await response.json();
}

export async function takeAdminReportAction(
    reportId: number,
    action: "delete" | "delete_suspend" | "delete_ban" | "warn" | "dismiss",
    reason?: string,
): Promise<{ message: string; status: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/report/${reportId}/action`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, reason }),
    });

    return await response.json();
}
