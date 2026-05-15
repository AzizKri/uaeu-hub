import type { User } from "firebase/auth";

interface BackendUser {
    id?: number;
    username?: string | null;
    displayname?: string | null;
    email?: string | null;
    bio?: string | null;
    pfp?: string | null;
    is_anonymous?: boolean | number | null;
    is_admin?: boolean | number | null;
    suspended_until?: number | null;
    is_banned?: boolean | number | null;
}

export function mapBackendUserToUserInfo(data: BackendUser, fbUser?: User | null): UserInfo {
    const now = Math.floor(Date.now() / 1000);
    const suspendedUntil = data.suspended_until ?? undefined;

    return {
        id: data.id,
        new: !data.username,
        username: data.username || "",
        displayName: data.displayname || fbUser?.displayName || "",
        email: data.email || undefined,
        bio: data.bio || "",
        pfp: data.pfp || fbUser?.photoURL || "",
        isAnonymous: !!data.is_anonymous || !!fbUser?.isAnonymous,
        isAdmin: !!data.is_admin,
        isSuspended: !!(suspendedUntil && suspendedUntil > now),
        suspendedUntil,
        isBanned: !!data.is_banned,
    };
}

export function mapFirebaseUserToNewUser(fbUser: User): UserInfo {
    return {
        new: true,
        username: "",
        displayName: fbUser.displayName || "",
        bio: "",
        pfp: fbUser.photoURL || "",
        isAnonymous: fbUser.isAnonymous,
        isAdmin: false,
        isSuspended: false,
        isBanned: false,
    };
}
