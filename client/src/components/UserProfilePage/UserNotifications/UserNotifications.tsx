import { useState, useEffect } from "react";
import styles from "./UserNotifications.module.scss";
import { getNotifications, readNotifications } from "../../../api/notifications";
import {useNavigate} from "react-router-dom";
import Skeleton from "../../Reusable/Skeleton/Skeleton.tsx";
import {getFormattedDate} from "../../../utils/tools.ts";
import ShowMoreBtn from "../../Reusable/ShowMoreBtn/ShowMoreBtn.tsx";


export default function UserNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const navigate = useNavigate();
    const [isLoadingMoreNotifications, setLoadingMoreNotifications] = useState<boolean>(false);


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
            );
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        }
    };
    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(n => !n.read);

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

    const handleShowMore = async () => {
        setLoadingMoreNotifications(true);
        const nextPage = (await getNotifications(filteredNotifications.length)).data;
        console.log("NEW DATA: ",nextPage);
        setNotifications(prev =>
            [...prev, ...nextPage.map((notification: {
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
            }))]
        )
        setLoadingMoreNotifications(false);
    }

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
            case 'invite':
            {  const metadata = notification.metadata as InvitationMetadata;
                const link = metadata.communityName.split(" ").join("%20");
                return `/community/${link}`; }
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
                return <span className={styles.sender}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> Replied to your comment</span>;
            case 'invite':
                return <span className={styles.sender}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> invited you to '{"communityName" in notification.metadata ? notification.metadata.communityName : ""}'</span>;
            default:
                return '#';
        }
    }
    const handleNotificationClick = (link: string) => {
        navigate(link);
    };



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
                                        {getMessage(notification)}
                                        <span className={styles.timestamp}>{getFormattedDate(notification.createdAt)}</span>
                                    </div>
                                    {notification.metadata.content && (
                                        <div className={styles.notifContent}>{notification.metadata.content}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        {filter === "all" ? "No notifications" : "No unread notifications"}
                    </div>
                )}
                {(filteredNotifications.length == 10) && (
                    <ShowMoreBtn onClick={handleShowMore} isLoadingMore={isLoadingMoreNotifications} />
                )}
            </div>
        </div>
    );
}
