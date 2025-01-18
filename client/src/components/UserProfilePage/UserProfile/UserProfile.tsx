import {useEffect, useState} from 'react';
import styles from './UserProfile.module.scss';
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import { getUserByUsername} from '../../../api/users.ts';
// import {me} from "../../../api/authentication.ts";
import {useUser} from "../../../lib/utils/hooks.ts";

const authTabs = [
    { label: 'Posts' },
    { label: 'Communities' },
    { label: 'Likes' },
];

const tabs = [
    { label: 'Posts' },
    { label: 'Communities' },
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
    const {user} = useUser()

    useEffect(() => {
        // const checkAuth = async (username : string) => {
        //     const response = await me();
        //     if (response) {
        //         return response.username === username;
        //     }
        //     return false;
        // }
        // console.log(location);
        setActiveTab(location.state?.data?.activeTab || 'Posts');
        if (username) {
            setIsAuthorized(user?.username === username);
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
               if (!location.state){
                   navigate('posts');
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
                auth: isAuthorized,
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
                <ul className={styles.tabs}>
                {isAuthorized ? authTabs.map((tab) => (
                        <li
                            key={tab.label}
                            className={`${styles.tabElement} ${
                                activeTab === tab.label ? styles.active : ''
                            }`}
                            onClick={() => handleTabClick(tab.label)}
                        >
                            {tab.label}
                        </li>
                    )) : tabs.map((tab) => (
                    <li
                        key={tab.label}
                        className={`${styles.tabElement} ${
                            activeTab === tab.label ? styles.active : ''
                        }`}
                        onClick={() => handleTabClick(tab.label)}
                    >
                        {tab.label}
                    </li>))}
                </ul>
            </div>

            <div className={styles.tabContent}>
                <Outlet />
            </div>
        </div>
    );
};
