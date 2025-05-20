import { useState, useEffect } from "react";
import styles from "./UserNotifications.module.scss";
import { getNotifications, readNotifications } from "../../../api/notifications";
import {useNavigate} from "react-router-dom";
import Skeleton from "../../Reusable/Skeleton/Skeleton.tsx";
import {getFormattedDate} from "../../../utils/tools.ts";


export default function UserNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const navigate = useNavigate();

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
                res.data
                    .map((notification: {
                        id: number;
                        action_entity_id: number;
                        recipient_id: number;
                        sender_id: number;
                        sender: string;
                        type: string;
                        read: boolean;
                        metadata: JSON;
                        created_at: number;
                    }) => ({
                        id: notification.id,
                        recipientId: notification.recipient_id,
                        senderId: notification.sender_id,
                        sender: notification.sender,
                        type: notification.type,
                        actionEntityId: notification.action_entity_id,
                        read: notification.read,
                        metadata: notification.metadata,
                        createdAt: new Date(notification.created_at),
                    }))
                    .sort((a : Notification, b : Notification) => b.createdAt.getTime() - a.createdAt.getTime())
            );
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        }
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
        switch (notification.type) {
            case 'like':
            { const metadata = notification.metadata as LikeMetadata;
                return `/post/${metadata.entityId}`; }
            case 'comment':
            { const metadata = notification.metadata as CommentMetadata;
                return `/post/${metadata.parentPostId}`; }
            case 'subcomment':
            {  const metadata = notification.metadata as SubcommentMetadata;
                return `/post/${metadata.parentPostId}`; }
            default:
                return '#';
        }
    };

    const getMessage= (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return <div className={styles.message}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> liked your post!</div>;
            case 'comment':
                return <div className={styles.message}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> Commented on your post!</div>;
            case 'subcomment':
                return <div className={styles.message}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> replied to your comment!</div>;
            default:
                return '#';
        }
    }
    const handleNotificationClick = (link: string) => {
        navigate(link);
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
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(getNotificationLink(notification))}
                            className={styles.notificationLink}
                        >
                            <div className={`${styles.notification} ${!notification.read ? styles.unread : ""}`}>
                                <div className={styles.content}>
                                    <div className={styles.notificationHeader}>
                                        <span className={styles.sender}>You Received a Notification!</span>
                                        <span className={styles.timestamp}>{getFormattedDate(notification.createdAt)}</span>
                                    </div>
                                    {getMessage(notification)}
                                </div>
                            </div>
                        </div>
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
