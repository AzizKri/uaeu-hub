import {ReactNode, useEffect, useState} from "react";
import {UserContext} from "./context.ts";
import {getCurrentUser} from "../api.ts";

export default function UserProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<userInfo | null>(null);

    useEffect(() => {
        const cashUserData = (userData: userInfo) => {
            const data = {
                userData,
                timestamp: Date.now(),
            }
            localStorage.setItem("userData", JSON.stringify(data));
        }

        const getCashedUserData = () => {
            const cashed = localStorage.getItem("userData");
            if (!cashed) return null;

            const {userData, timestamp} = JSON.parse(cashed);
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
                const cashedUser = getCashedUserData();
                if (cashedUser) {
                    setUser(cashedUser);
                    return;
                }

                const response = await getCurrentUser();
                if (response.ok) {
                    const data = await response.json();
                    const usefulData = {
                        username: data.username,
                        displayName: data.displayName,
                        bio: data.bio,
                        pfp: data.pfp
                    };
                    cashUserData(usefulData);
                    setUser(usefulData)
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.log("Error fetching user data", error);
            }
        };

        fetchUserData().then(() => console.log("User Data fetched"));
    }, [])

    const updateUser = (newUser: userInfo) => {
        localStorage.setItem("userData", JSON.stringify(newUser));
        setUser(newUser);
    }

    const removeUser = () => {
        localStorage.removeItem("userData");
        setUser(null);
    }

    return (
        <UserContext.Provider value={{user, updateUser, removeUser}}>
            {children}
        </UserContext.Provider>
    )
}
