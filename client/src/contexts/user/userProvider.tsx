import { createContext, ReactNode, useEffect, useState } from "react";
import { logout, me } from '../../api/authentication';
import { mapBackendUserToUserInfo } from "./mapBackendUser.ts";

export const UserContext = createContext<UserContextInterface | null>(null);

export default function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [userReady, setUserReady] = useState(false);

    const cacheUserData = (userData: UserInfo) => {
        const data = {
            userData,
            timestamp: Date.now(),
        }
        localStorage.setItem("userData", JSON.stringify(data));
    }

    const fetchUserData = async () => {
        try {
            const data = await me();
            if (!data) {
                localStorage.removeItem("userData");
                setUser(null);
                return;
            }

            if (data.is_banned) {
                localStorage.removeItem("userData");
                await logout();
                sessionStorage.setItem("bannedUserAttempt", "true");
                setUser(null);
                return;
            }

            const usefulData = mapBackendUserToUserInfo(data);
            cacheUserData(usefulData);
            setUser(usefulData);
        } catch (error) {
            console.log("Error fetching user data from backend", error);
            localStorage.removeItem("userData");
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUserData().finally(() => setUserReady(true));
    }, []);

    const updateUser = (newUser: UserInfo) => {
        setUser(newUser);
        cacheUserData(newUser);
    }

    const removeUser = () => {
        localStorage.removeItem("userData");
        setUser(null);
    }

    const isUser = (): boolean => {
        return user !== null && !user.isAnonymous && !user.new;
    }

    const isSuspended = (): boolean => {
        if (!user) return false;
        const now = Math.floor(Date.now() / 1000);
        return !!(user.suspendedUntil && user.suspendedUntil > now);
    }

    const isBanned = (): boolean => {
        return user?.isBanned === true;
    }

    const setSuspended = (suspendedUntil: number) => {
        if (user) {
            const updatedUser = { ...user, isSuspended: true, suspendedUntil };
            setUser(updatedUser);
            cacheUserData(updatedUser);
        }
    }

    const setBanned = () => {
        if (user) {
            const updatedUser = { ...user, isBanned: true };
            setUser(updatedUser);
            cacheUserData(updatedUser);
        }
    }

    return (
        <UserContext.Provider value={{
            user,
            userReady,
            updateUser,
            removeUser,
            isUser,
            isSuspended,
            isBanned,
            setSuspended,
            setBanned,
        }}>
            {children}
        </UserContext.Provider>
    )
}
