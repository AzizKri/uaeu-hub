import {useEffect, useState} from 'react';
import styles from './UserProfile.module.scss';
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import { getUserByUsername, me } from '../../../api.ts';

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
    const location = useLocation();
    // console.log(location);
    const [activeTab, setActiveTab] = useState('');
    const [profileUser, setProfileUser] = useState<UserInfo>();
    const { username } =  useParams<{ username: string }>();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    useEffect(() => {
        const checkAuth = async (username : string) => {
            const response = await me();
            if (response.ok) {
                const data = await response.json();
                return data.username === username;
            }
            return false;
        }
        // console.log(location);
        setActiveTab(location.state?.data?.activeTab || '');
        if (username) {
            checkAuth(username).then((res) => setIsAuthorized(res));
            getUserByUsername(username).then((res) => {
               // console.log(username);
               const data = res.data;
               // console.log(data);
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
               }
            });
        }
    }, []);


    const handleTabClick = (tabLabel: string) => {
        setActiveTab(tabLabel);
        const tab = tabLabel.toLowerCase();
        navigate(tab, {state: {
            data: {
                activeTab: tabLabel,
            }
            }});
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
