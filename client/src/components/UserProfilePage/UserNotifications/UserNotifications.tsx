import { useState, useEffect } from "react";
import styles from "./UserNotifications.module.scss";
import { getNotifications, readNotifications } from "../../../api/notifications";
import Skeleton from "../../Reusable/Skeleton/Skeleton.tsx";
import ShowMoreBtn from "../../Reusable/ShowMoreBtn/ShowMoreBtn.tsx";
import NotificationItem from "../../Notifications/NotificationItem.tsx";
import { useUser } from "../../../contexts/user/UserContext.ts";


export default function UserNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [isLoadingMoreNotifications, setLoadingMoreNotifications] = useState<boolean>(false);
    const { user } = useUser();


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
                    .filter((n: Notification) => n.sender !== user?.username)
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
                window.dispatchEvent(new CustomEvent('notificationsMarkedAsRead'));
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
            })).filter((n: Notification) => n.sender !== user?.username)]
        )
        setLoadingMoreNotifications(false);
    }

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
                        <NotificationItem notification={notification} />
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
