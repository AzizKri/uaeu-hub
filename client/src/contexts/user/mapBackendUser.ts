import type { AuthUser } from "../../api/authentication.ts";

export function mapBackendUserToUserInfo(data: AuthUser): UserInfo {
    const now = Math.floor(Date.now() / 1000);
    const suspendedUntil = data.suspended_until ?? undefined;

    return {
        id: data.id,
        new: !data.username,
        username: data.username || "",
        displayName: data.displayname || "",
        email: data.email || undefined,
        bio: data.bio || "",
        pfp: data.pfp || "",
        isAnonymous: !!data.is_anonymous,
        isAdmin: !!data.is_admin,
        isSuspended: !!(suspendedUntil && suspendedUntil > now),
        suspendedUntil,
        isBanned: !!data.is_banned,
    };
}
