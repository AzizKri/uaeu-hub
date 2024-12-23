import {ReactNode, useState} from "react";
import {UserContext} from "./context.ts";

export default function UserProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<UserInfo | null>(null);

    const updateUser = (newUser: UserInfo) => {
        setUser(newUser);
    }

    return (
        <UserContext.Provider value={{user, updateUser}}>
            {children}
        </UserContext.Provider>
    )
}
