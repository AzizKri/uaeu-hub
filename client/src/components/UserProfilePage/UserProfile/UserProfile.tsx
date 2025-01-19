import {useEffect, useState} from 'react';
import styles from './UserProfile.module.scss';
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import { getUserByUsername} from '../../../api/users.ts';
import {useUser} from "../../../lib/utils/hooks.ts";
import ImageUploader from "../../Reusable/ImageUploader/ImageUploader.tsx";
import defaultProfilePicture from "../../../assets/profile-picture.png";
import EditUserPopUp from "../EditUserPopUp/EditUserPopUp.tsx";

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
    const [showPopup, setShowPopup] = useState(false);
    const [activeTab, setActiveTab] = useState('');
    const [profileUser, setProfileUser] = useState<UserInfo>();
    const { username } =  useParams<{ username: string }>();
    const { user } = useUser();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);


    useEffect(() => {
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
                       id: data.id,
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
                setUploadState({
                    status: "IDLE",
                    file: null,
                    preview: data.pfp,
                });
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
                user_id: profileUser?.id
            }
            }});
    };

    const handleClick = () => {
        setShowPopup(true);
    }

    const onClose = () => {
        setShowPopup(false);
    }

    const onSave = (updatedDisplayName: string, updatedBio: string) => {
        console.log(updatedDisplayName);
        console.log(updatedBio);
        setShowPopup(false);
        editCurrentUser(updatedDisplayName, updatedBio, updatedPfp).then((status) => {
            console.log("edit result", status)
            if (status === 200) {
                setProfileUser(prev => prev && ({
                    ...prev,
                    displayName: updatedDisplayName,
                    bio: updatedBio,
                    pfp: updatedPfp,
                }))
            }
        })
    }
    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.userProfileHeader}>
                <div className={styles.userHeader}>
                    <div className={styles.userAvatar}>
                        <img src={profileUser?.pfp ? profileUser.pfp : defaultProfilePicture} alt="profile picture"/>
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.displayName}>{profileUser ? profileUser.displayName : ''}</h1>
                        <h2 className={styles.username}>@{profileUser ? profileUser.username : ''}</h2>
                        <p className={styles.userBio}>
                            {profileUser ? (profileUser.bio ? profileUser.bio : '') : ''}
                        </p>
                    </div>
                    {isAuthorized ? (<button className={styles.editProfileButton} onClick={handleClick}>Edit Profile</button>) : (<></>)}
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
            {showPopup && (
                <EditUserPopUp
                    onClose={onClose}
                    currentDisplayName={profileUser?.displayName ? profileUser.displayName : ''}
                    currentBio={profileUser?.bio ? profileUser.bio : ''}
                    onSave={onSave}
                />
            )}
        </div>
    );
};
