import { useState, useEffect } from "react";
import styles from "./NotificationsDropDown.module.scss";
import {useNavigate} from "react-router-dom";
import { getNotifications, readNotifications } from "../../api/notifications.ts";
import Skeleton from "../Reusable/Skeleton/Skeleton.tsx";
import {useUser} from "../../contexts/user/UserContext.ts";

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

interface NotificationsDropDownProps {
    isVisible: boolean;
    onRefreshNotifications: () => void;
    onClose: () => void;
}

export default function NotificationsDropDown({
                                                  isVisible,
                                                  onRefreshNotifications,
                                                  onClose,
                                              }: NotificationsDropDownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!isVisible) return;

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

        if (isVisible) {
            fetchNotifications();
        }
    }, [isVisible]);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            if (hours < 1) {
                const minutes = Math.floor(diff / (60 * 1000));
                return minutes <= 0 ? 'Just now' : `${minutes}m ago`;
            }
            return `${hours}h ago`;
        }

        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `${days}d ago`;
        }

        return date.toLocaleDateString();
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await readNotifications();
            if (response.status === 200) {
                setNotifications(notifications.map(notification => ({
                    ...notification,
                    read: true
                })));

                onRefreshNotifications();
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

    const handleViewAll = () => {
        onClose();
        navigate(`/user/${user?.username}`, { state: { activeTab: "Notifications" } });
    };

    const handleNotificationClick = (link: string) => {
        onClose();
        navigate(link);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.dropdown}>
            <div className={styles.header}>
                <h3>Notifications</h3>
                <button
                    className={styles.markAllRead}
                    onClick={handleMarkAllAsRead}
                >
                    Mark all as read
                </button>
            </div>
            <div className={styles.notificationList}>
                {loading ? (
                    <div className={styles.loading}>
                        <Skeleton type={'notification'}/>
                        <Skeleton type={'notification'}/>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={styles.notificationLink}
                            onClick={() => handleNotificationClick(getNotificationLink(notification))}
                        >
                            <div
                                className={`${styles.notification} ${
                                    !notification.read ? styles.unread : ""
                                }`}
                            >
                                <div className={styles.notificationHeader}>
                                    <span className={styles.sender}>{notification.senderDisplayname}</span>
                                    <span className={styles.timestamp}>{formatTime(notification.createdAt)}</span>
                                </div>
                                <div className={styles.message}>{notification.message}</div>
                                {notification.content && (
                                    <div className={styles.content}>{notification.content}</div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty} >No notifications</div>
                )}
            </div>
            <div className={styles.footer}>
                <button className={styles.viewAll}  onClick={handleViewAll}>View all notifications</button>
            </div>
        </div>
    );
}
