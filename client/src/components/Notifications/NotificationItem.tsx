import {getFormattedDate} from "../../utils/tools.ts";
import {getMessage, getNotificationLink} from "../../utils/notificationsTools.ts";
import {useNavigate} from "react-router-dom";
import styles from "./NotificationsDropDown.module.scss";

interface NotificationItem {
    notification : Notification,
    onClick? : () => void
};

export default function NotificationItem({notification, onClick} : NotificationItem) {
    const navigate = useNavigate();
    
    const handleNotificationClick = (link : string) => {
        if (onClick) {
            onClick();
        }
        navigate(link);
    }
    
    return (
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
                <span className={styles.sender}><a className={styles.senderLink} href={`/user/${notification.sender}`}>@{notification.sender}</a> {getMessage(notification)}</span>
                <span className={styles.timestamp}>{getFormattedDate(notification.createdAt)}</span>
            </div>
            {notification.metadata.content && (
                 <div className={styles.content}>{notification.metadata.content}</div>
            )}
        </div>
    </div>
    );
}