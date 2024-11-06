import {ReactNode, useState} from "react";
import {UserContext} from "./context.ts";

export default function UserProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<userInfo | null>(null);

    const updateUser = (newUser: userInfo) => {
        setUser(newUser);
    }

    return (
        <UserContext.Provider value={{user, updateUser}}>
            {children}
        </UserContext.Provider>
    )
}
