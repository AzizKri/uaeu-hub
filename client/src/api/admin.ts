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

export async function getAdminStats(): Promise<{
    stats: AdminStats;
    topCommunities: TopCommunity[];
}> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base}/admin/stats`, { headers });
    return await response.json();
}
