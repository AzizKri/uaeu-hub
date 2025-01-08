import {ReactNode, useEffect, useState} from "react";
import {UserContext} from "../utils/context.ts";
import { me } from '../../api/authentication.ts';

export default function UserProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [userReady, setUserReady] = useState(false);

    useEffect(() => {
        const cacheUserData = (userData: UserInfo) => {
            const data = {
                userData,
                timestamp: Date.now(),
            }
            localStorage.setItem("userData", JSON.stringify(data));
        }

        const getCachedUserData = () => {
            const cached = localStorage.getItem("userData");
            if (!cached) return null;

            const {userData, timestamp} = JSON.parse(cached);

            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 1 day

            if (now - timestamp > maxAge) {
                localStorage.removeItem("userData");
                return null;
            }

            return userData;
        }

        const fetchUserData = async () => {
            try {
                const cachedUser = getCachedUserData();
                if (cachedUser) {
                    setUser(cachedUser);
                    return;
                }

                const data = await me();
                console.log("User data fetched from API", data);
                if (data) {
                    const usefulData = {
                        new: (!data.username),
                        username: data.username,
                        displayName: data.displayName,
                        bio: data.bio,
                        pfp: data.pfp,
                        isAnonymous: data.is_anonymous,
                    };
                    cacheUserData(usefulData);
                    setUser(usefulData)
                    setUserReady(true);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.log("Error fetching user data", error);
                setUser(null);
            } finally {
                setUserReady(true);
            }
        };

        fetchUserData();
    }, [])

    const updateUser = (newUser: UserInfo) => {
        localStorage.setItem("userData", JSON.stringify(newUser));
        setUser(newUser);
    }

    const removeUser = () => {
        localStorage.removeItem("userData");
        setUser(null);
    }

    const isUser = (): boolean => {
        return user !== null && !user.isAnonymous && !user.new
    }

    return (
        <UserContext.Provider value={{user, userReady, updateUser, removeUser, isUser}}>
            {children}
        </UserContext.Provider>
    )
}
