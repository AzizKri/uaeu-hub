import {useContext} from "react";
import {UserContext} from "./userProvider.tsx";

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a provider');
    }
    return context;
}
