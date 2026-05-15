import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/user/UserContext.ts";
import styles from "./AdminWorkspace.module.scss";

export default function AdminGuard({ children }: { children: ReactNode }) {
    const { user, isUser } = useUser();
    const location = useLocation();

    if (!isUser()) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: `${location.pathname}${location.search}` }}
            />
        );
    }

    if (!user?.isAdmin) {
        return (
            <div className={styles.notFound}>
                <h1>404</h1>
                <h2>Page not found</h2>
            </div>
        );
    }

    return <>{children}</>;
}
