import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./AdminWorkspace.module.scss";

const navItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/reports", label: "Reports" },
    { path: "/admin/bug-reports", label: "Bug Reports" },
    { path: "/admin/feature-requests", label: "Feature Requests" },
];

export default function AdminWorkspace() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <section className={styles.workspace}>
            <header className={styles.header}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Moderate reports, feedback, and platform activity.</p>
                </div>
                <nav className={styles.nav} aria-label="Admin navigation">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ""}`}
                            onClick={() => navigate(item.path)}
                            type="button"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </header>
            <Outlet />
        </section>
    );
}
