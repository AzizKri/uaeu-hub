import React, { useState } from 'react';
import styles from './UserProfile.module.scss';

type UserProfileProps = {
    displayName: string;
    username: string;
};

const tabs = [
    { label: 'Posts' },
    { label: 'Comments' },
    { label: 'Saved' },
    { label: 'Liked' },
];

export default function UserProfile ({ displayName, username }) {
    // State for the current tab
    const [activeTab, setActiveTab] = useState('Posts');

    const handleTabClick = (tabLabel: string) => {
        setActiveTab(tabLabel);
    };

    // Example content for "hasn't posted yet"
    const getTabContent = (currentTab: string) => {
        switch (currentTab) {
            case 'Posts':
                return (
                    <div className={styles.noPosts}>
                        <p>{`@${username} hasn't posted yet`}</p>
                    </div>
                );
            case 'Comments':
                return (
                    <div className={styles.noPosts}>
                        <p>{`@${username} hasn't commented yet`}</p>
                    </div>
                );
            case 'Overview':
                return (
                    <div className={styles.overview}>
                        <p>This is the user’s Overview section.</p>
                    </div>
                );
            default:
                return (
                    <div className={styles.noPosts}>
                        <p>{`No ${currentTab.toLowerCase()} available yet`}</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.userHeader}>
                <div className={styles.userAvatar}>
                    <div className={styles.avatarIcon} />
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.displayName}>{displayName}</h1>
                    <h2 className={styles.username}>@{username}</h2>
                </div>
                <button className={styles.editProfileButton}>Edit Profile</button>
            </div>

            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.label}
                        className={`${styles.tabButton} ${
                            activeTab === tab.label ? styles.active : ''
                        }`}
                        onClick={() => handleTabClick(tab.label)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>{getTabContent(activeTab)}</div>
        </div>
    );
};
