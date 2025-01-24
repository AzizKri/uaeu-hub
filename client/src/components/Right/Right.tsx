import styles from './Right.module.scss';
import { useEffect, useState } from 'react';
import { getCommunities } from '../../api/communities.ts';
import CommunityPreview from '../Communities/CommunityPreview/CommunityPreview.tsx';
import { getNotifications } from '../../api/notifications.ts';

export default function Right() {
    const [trendingCommunities, setTrendingCommunities] = useState<
        CommunityInfo[]
    >([]);

    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        getCommunities('members').then((res) => {
            setTrendingCommunities(
                res.data.map(
                    (com: {
                        id: number;
                        name: string;
                        description: string;
                        icon?: string;
                        public: boolean;
                        inviteOnly: boolean;
                        created_at: string | number | Date;
                        tags: string;
                        member_count: number;
                        is_member: boolean;
                    }) => ({
                        id: com.id,
                        name: com.name,
                        description: com.description,
                        icon: com.icon,
                        public: com.public,
                        inviteOnly: com.inviteOnly,
                        createdAt: new Date(com.created_at),
                        tags: com.tags,
                        memberCount: com.member_count,
                        isMember: com.is_member
                    })
                )
            );
        });
    }, []);

    // TODO - Hussain or Mohammmad: Move this to a notifications page. Below is the implementation.

    useEffect(() => {
        getNotifications().then((res) => {
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
        });
    }, []);

    const onJoin = (id: number) => {
        setTrendingCommunities((prev) => (
            prev.map((com) => {
                if (com.id === id) {
                    return { ...com, isMember: true };
                } else {
                    return com;
                }
            })
        ));
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                Trending Communities
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                >
                    <path
                        d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
                </svg>
            </div>
            <ul className={styles.list}>
                {trendingCommunities.map((com) => (
                    <CommunityPreview
                        key={com.id}
                        icon={com.icon}
                        name={com.name}
                        id={com.id}
                        members={com.memberCount}
                        isMember={com.isMember}
                        onJoin={onJoin}
                    />
                    // <li className={styles.community}>
                    //     <img
                    //         src={com.icon ? com.icon : communityIcon}
                    //         alt="Community Icon"
                    //         className={styles.communityIcon}
                    //     />
                    //     <span className={styles.communityName}>{com.name}</span>
                    // </li>
                ))}

                {notifications.map((notification) => (
                    <div key={notification.id}>
                        {notification.message}
                        {notification.content}
                    </div>
                ))}
            </ul>
        </div>
    );
}
