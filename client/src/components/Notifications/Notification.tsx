import { useState, useRef, useEffect } from "react";
import styles from "./Notification.module.scss";
import NotificationsDropDown from "./NotificationsDropDown";
import { getNotifications } from "../../api/notifications.ts";
import notificationLogo from "../../assets/notification-bell.svg";
import { useUser } from "../../contexts/user/UserContext.ts";

export default function Notification() {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();

    const fetchUnreadCount = async () => {
        try {
            const res = await getNotifications();
            if (Object.keys(res.data).length === 0) {
                setUnreadCount(0);
                return;
            }

            const unreadNotifications = res.data.filter(
                (notification: { read: boolean; sender: string }) => !notification.read && notification.sender !== user?.username
            );

            setUnreadCount(unreadNotifications.length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    const closeDropdown = () => {
        setIsDropdownVisible(false);
    };

    useEffect(() => {
        fetchUnreadCount();

        const intervalId = setInterval(fetchUnreadCount, 30000);

        const handleNotificationsMarkedAsRead = () => {
            fetchUnreadCount();
        };

        window.addEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.notificationContainer} ref={notificationRef}>
            <div className={styles.icon} onClick={toggleDropdown}>
                <img
                    src={notificationLogo}
                    className={styles.icon}
                    alt="verification icon"
                />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
            </div>
            <NotificationsDropDown
                isVisible={isDropdownVisible}
                onRefreshNotifications={fetchUnreadCount}
                onClose={closeDropdown}
            />
        </div>
    );
}
