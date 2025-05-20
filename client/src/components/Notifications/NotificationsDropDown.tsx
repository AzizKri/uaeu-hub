import { useState, useEffect } from "react";
import styles from "./NotificationsDropDown.module.scss";
import {useNavigate} from "react-router-dom";
import { getNotifications, readNotifications } from "../../api/notifications.ts";
import Skeleton from "../Reusable/Skeleton/Skeleton.tsx";
import {useUser} from "../../contexts/user/UserContext.ts";
import {getFormattedDate} from "../../utils/tools.ts";

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
                console.log("RESPONSE: ",res.data);

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
                        .filter((n : Notification) => !n.read)
                        .sort((a : Notification, b : Notification) => b.createdAt.getTime() - a.createdAt.getTime())
                );
                setLoading(false);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setLoading(false);
            }
        };

        if (isVisible) {
            fetchNotifications();
            console.log(notifications);
        }
    }, [isVisible]);

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
                return <span className={styles.sender}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> liked your post!</span>;
            case 'comment':
                return <span className={styles.sender}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> Commented on your post!</span>;
            case 'subcomment':
                return <span className={styles.sender}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> replied to your comment!</span>;
            default:
                return '#';
        }
    }

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
                                    {getMessage(notification)}
                                    <span className={styles.timestamp}>{getFormattedDate(notification.createdAt)}</span>
                                </div>
                                {notification.metadata.content && (
                                    <div className={styles.content}>{notification.metadata.content}</div>
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
