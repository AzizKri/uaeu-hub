import {useEffect, useState} from 'react';
import styles from './UserProfile.module.scss';
import {useNavigate, useParams} from "react-router-dom";
import {getUserByUsername} from "../../api.ts";



const tabs = [
    { label: 'Posts' },
    { label: 'Comments' },
    { label: 'Liked' },
];

export default function UserProfile () {
    // State for the current tab
    const [activeTab, setActiveTab] = useState('Posts');
    const [user, setUser] = useState<userInfo>();
    const { username } =  useParams<{ username: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (username) {
           getUserByUsername(username).then(async (res) => {
               console.log(res);
               const data = await res.json();
               console.log(data);
               if (res.status !== 200){
                   navigate('/error');
               } else{
                   setUser({
                       username: data.username,
                       displayName: data.displayname,
                       bio: data.bio,
                       pfp: data.pfp,
                       isAnonymous: false,
                   });
               }
            });
        }
    }, [username]);

    const handleTabClick = (tabLabel: string) => {
        setActiveTab(tabLabel);
    };

    // Example content for "hasn't posted yet"
    const getTabContent = (currentTab: string) => {
        switch (currentTab) {
            case 'Posts':

                return (
                    <div className={styles.noPosts}>
                        <p>{`@${user ? user.username : ''} hasn't posted yet`}</p>
                    </div>
                );
            case 'Comments':
                return (
                    <div className={styles.noPosts}>
                        <p>{`@${user ? user.username : ''} hasn't commented yet`}</p>
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
                    <div className={styles.avatarIcon} style={{backgroundImage : `url(${user ? (user.pfp ? user.pfp : '') : ''})`}} />
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.displayName}>{user ? user.displayName : ''}</h1>
                    <h2 className={styles.username}>@{user ? user.username : ''}</h2>
                    <p className={styles.userBio}>
                        {user ? (user.bio ? user.bio : '') : ''}
                    </p>
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

            <div className={styles.tabContent}>{getTabContent(activeTab)}</div>
        </div>
    );
};
