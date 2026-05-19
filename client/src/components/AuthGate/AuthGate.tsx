import { ReactNode } from "react";
import { useUser } from "../../contexts/user/UserContext";
import LoadingFallback from "../Reusable/LoadingFallback/LoadingFallback";

export default function AuthGate({ children }: { children: ReactNode }) {
    const { userReady } = useUser();
    
    if (!userReady) {
        return <LoadingFallback />;
    }
    
    return <>{children}</>;
}
