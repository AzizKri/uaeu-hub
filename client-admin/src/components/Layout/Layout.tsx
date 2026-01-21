import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Layout.module.scss';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, isLoading, logout, isAuthenticated } = useAdminAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
        navigate('/login', { replace: true });
        return null;
    }

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/reports', label: 'Reports', icon: '🚨' },
        { path: '/bug-reports', label: 'Bug Reports', icon: '🐛' },
        { path: '/feature-requests', label: 'Features', icon: '💡' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h1>Admin Panel</h1>
                </div>
                
                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button className={styles.themeToggle} onClick={toggleTheme}>
                    <span className={styles.icon}>{theme === 'light' ? '🌙' : '☀️'}</span>
                    <span className={styles.label}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <span className={styles.username}>{user?.username}</span>
                        <span className={styles.role}>Administrator</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
