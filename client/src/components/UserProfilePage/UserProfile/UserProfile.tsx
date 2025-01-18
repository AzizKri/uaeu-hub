import React, {useEffect, useRef, useState} from 'react';
import styles from './UserProfile.module.scss';
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import { getUserByUsername} from '../../../api/users.ts';
import editImage from "../../../assets/image-edit-outline.svg";
import {deleteAttachment, uploadAttachment} from "../../../api/attachmets.ts";
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

interface UploadState {
    status: "IDLE" | "UPLOADING" | "COMPLETED" | "ERROR";
    fileName?: string;
    file: File | null;
    preview: string | ArrayBuffer | null;
}

export default function UserProfile () {
    // State for the current tab
    const location = useLocation();
    // console.log(location);
    const [activeTab, setActiveTab] = useState('');
    const [profileUser, setProfileUser] = useState<UserInfo>();
    const { username } =  useParams<{ username: string }>();
    const { user } = useUser();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [uploadState, setUploadState] = useState<UploadState>({
                status: "IDLE",
                file: null,
                preview: null,}
    );
    const imageInputRef = useRef<HTMLInputElement>(null);

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
            }
            }});
    };

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        try {
            setUploadState({
                status: "UPLOADING",
                file: selectedFile,
                preview: null,
            });

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadState((prev) => ({
                    ...prev,
                    preview: e.target?.result || null,
                }));
            };
            reader.readAsDataURL(selectedFile);

            // Upload file
            const response = await uploadAttachment([selectedFile]);

            if (response.status === 201) {
                setUploadState((prev) => ({
                    ...prev,
                    status: "COMPLETED",
                    fileName: response.filename,
                }));
            } else {
                console.error(`Upload failed with status: ${response.status}`);
                setUploadState({
                    status: "ERROR",
                    file: null,
                    preview: null,
                });
            }
        } catch (error) {
            console.error("File upload error:", error);
            setUploadState({
                status: "ERROR",
                file: null,
                preview: null,
            });
        }
    };

    const handleChangeImage = () => {
        if (typeof uploadState.fileName === "string")
            deleteAttachment(uploadState.fileName).then(() =>
                console.log("attachment deleted"),
            );
        imageInputRef.current?.click();
    };

    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.userProfileHeader}>
                <div className={styles.userHeader}>
                    <div className={styles.userAvatar}>
                        <div className={styles.avatarIcon}
                             style={{backgroundImage: `url(${profileUser ? (profileUser.pfp ? profileUser.pfp : '') : ''})`}}>
                            {isAuthorized && <div
                                className={styles.changeImage}
                                onClick={handleChangeImage}
                            >
                                <img src={editImage} alt="edit image"/>
                                <input
                                    id="image-upload"
                                    ref={imageInputRef}
                                    className={styles.imageInput}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    hidden
                                />
                            </div>}
                        </div>
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
