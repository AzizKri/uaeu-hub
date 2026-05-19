import { apiFetch } from "./client";
import { getResponseErrorMessage } from "./errors";

const base = import.meta.env.VITE_API_URL || "https://api.uaeu.chat";

async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    return headers;
}

export async function getAdminStats(): Promise<{
    stats: AdminStats;
    topCommunities: TopCommunity[];
}> {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${base}/admin/stats`, { headers });
    if (!response.ok) {
        throw new Error(
            await getResponseErrorMessage(
                response,
                'Could not load dashboard data.',
            ),
        );
    }
    return await response.json();
}
