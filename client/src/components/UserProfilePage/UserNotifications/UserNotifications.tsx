import { useState, useEffect } from "react";
import styles from "./UserNotifications.module.scss";
import { getNotifications, readNotifications } from "../../../api/notifications";
import { Link } from "react-router-dom";
import Skeleton from "../../Reusable/Skeleton/Skeleton.tsx";

interface Notification {
    id: number;
    recipientId: number;
    senderId: number;
    sender: string;
    senderDisplayname: string;
    type: string;
    entityId: number;
    entityType: string;
    message: string;
    content?: string;
    read: boolean;
    createdAt: Date;
}

export default function UserNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotifications();
            if (Object.keys(res.data).length === 0) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            setNotifications(
                res.data.map(
                    (notification: {
                        id: number;
                        recipient_id: number;
                        sender_id: number;
                        sender: string;
                        sender_displayname: string;
                        type: string;
                        entity_id: number;
                        entity_type: string;
                        message: string;
                        content?: string;
                        read: boolean;
                        created_at: number;
                    }) => ({
                        id: notification.id,
                        recipientId: notification.recipient_id,
                        senderId: notification.sender_id,
                        sender: notification.sender,
                        senderDisplayname: notification.sender_displayname,
                        type: notification.type,
                        entityId: notification.entity_id,
                        entityType: notification.entity_type,
                        message: notification.message,
                        content: notification.content,
                        read: notification.read,
                        createdAt: new Date(notification.created_at)
                    })
                )
            );
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await readNotifications();
            if (response.status === 200) {
                setNotifications(notifications.map(notification => ({
                    ...notification,
                    read: true
                })));
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const getNotificationLink = (notification: Notification) => {
        switch (notification.entityType) {
            case 'post':
                return `/post/${notification.entityId}`;
            case 'comment':
                return `/post/${notification.entityId}#comments`;
            case 'user':
                return `/user/${notification.sender}`;
            default:
                return '#';
        }
    };

    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(n => !n.read);

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.header}>
                <div className={styles.actions}>
                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.filterButton} ${filter === "unread" ? styles.active : ""}`}
                            onClick={() => setFilter("unread")}
                        >
                            Unread
                        </button>
                    </div>
                    <button
                        className={styles.markAllReadButton}
                        onClick={handleMarkAllAsRead}
                    >
                        Mark all as read
                    </button>
                </div>
            </div>

            <div className={styles.notificationsList}>
                {loading ? (
                    <div className={styles.loading}>
                        <Skeleton type={'notification'}/>
                        <Skeleton type={'notification'}/>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <Link
                            key={notification.id}
                            to={getNotificationLink(notification)}
                            className={styles.notificationLink}
                        >
                            <div className={`${styles.notification} ${!notification.read ? styles.unread : ""}`}>
                                <div className={styles.content}>
                                    <div className={styles.notificationHeader}>
                                        <span className={styles.sender}>{notification.senderDisplayname}</span>
                                        <span className={styles.timestamp}>{formatTime(notification.createdAt)}</span>
                                    </div>
                                    <div className={styles.message}>{notification.message}</div>
                                    {notification.content && (
                                        <div className={styles.preview}>{notification.content}</div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.empty}>
                        {filter === "all" ? "No notifications" : "No unread notifications"}
                    </div>
                )}
            </div>
        </div>
    );
}
