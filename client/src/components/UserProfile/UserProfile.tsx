import {useEffect, useState} from 'react';
import styles from './UserProfile.module.scss';
import {Outlet, useNavigate, useParams} from "react-router-dom";
import {getUserByUsername} from "../../api.ts";
import {useUser} from "../../lib/hooks.ts";



const authTabs = [
    { label: 'Posts' },
    { label: 'Comments' },
    { label: 'Likes' },
];

const tabs = [
    { label: 'Posts' },
    { label: 'Comments' },
];

export default function UserProfile () {
    // State for the current tab
    const [activeTab, setActiveTab] = useState('');
    const [profileUser, setProfileUser] = useState<userInfo>();
    const { username } =  useParams<{ username: string }>();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const {user} = useUser();


    useEffect(() => {
        if (username) {
           getUserByUsername(username).then((res) => {
               console.log(username);
               const data = res.data;
               console.log(data);
               if (res.status !== 200){
                   navigate('/error');
               } else{
                   setProfileUser({
                       username: data.username,
                       displayName: data.displayname,
                       bio: data.bio,
                       pfp: data.pfp,
                       isAnonymous: false,
                   });
                   const auth : boolean = (user?.username === username);
                   setIsAuthorized(auth);
               }
            });
        }
    }, [username, navigate]);

    const handleTabClick = (tabLabel: string) => {
        setActiveTab(tabLabel);
        const tab = tabLabel.toLowerCase();
        navigate(tab);
    };

    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.userProfileHeader}>
                <div className={styles.userHeader}>
                    <div className={styles.userAvatar}>
                        <div className={styles.avatarIcon} style={{backgroundImage : `url(${profileUser ? (profileUser.pfp ? profileUser.pfp : '') : ''})`}} />
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.displayName}>{profileUser ? profileUser.displayName : ''}</h1>
                        <h2 className={styles.username}>@{profileUser ? profileUser.username : ''}</h2>
                        <p className={styles.userBio}>
                            {profileUser ? (profileUser.bio ? profileUser.bio : '') : ''}
                        </p>
                    </div>
                    {isAuthorized ? (<button className={styles.editProfileButton}>Edit Profile</button>) : (<></>)}
                </div>
                <div className={styles.tabs}>
                {isAuthorized ? authTabs.map((tab) => (
                        <button
                            key={tab.label}
                            className={`${styles.tabButton} ${
                                activeTab === tab.label ? styles.active : ''
                            }`}
                            onClick={() => handleTabClick(tab.label)}
                        >
                            {tab.label}
                        </button>
                    )) : tabs.map((tab) => (
                    <button
                        key={tab.label}
                        className={`${styles.tabButton} ${
                            activeTab === tab.label ? styles.active : ''
                        }`}
                        onClick={() => handleTabClick(tab.label)}
                    >
                        {tab.label}
                    </button>))}
                </div>
            </div>

            <div className={styles.tabContent}>
                <Outlet />
            </div>
        </div>
    );
};
