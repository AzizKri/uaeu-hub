import { useEffect, useState } from "react";
import styles from "./UserProfile.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { getUserByUsername } from "../../../api/users.ts";
import EditUserPopUp from "../EditUserPopUp/EditUserPopUp.tsx";
import UserPosts from "../UserPosts/UserPosts.tsx";
import UserCommunities from "../UserCommunities/UserCommunities.tsx";
import UserLikes from "../UserLikes/UserLikes.tsx";
import { editCurrentUser } from "../../../api/currentUser.ts";
import ProfilePictureComponent from "../../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";
import UserProfileSkeleton from "./UserProfileSkeleton.tsx";
import {changePassword} from "../../../api/authentication.ts";
import ConfirmationPopUp from "../../UserAuthentication/ConfirmationPopUp/ConfirmationPopUp.tsx";

type tab = "Posts" | "Communities" | "Likes"

const authTabs: {label: tab }[] = [
    { label: "Posts" },
    { label: "Communities" },
    { label: "Likes" },
];

const tabs: {label: tab}[] = [{ label: "Posts" }, { label: "Communities" }];

export default function UserProfile() {
    const [showPopup, setShowPopup] = useState(false);
    const [activeTab, setActiveTab] = useState<tab>("Posts");
    const [profileUser, setProfileUser] = useState<UserInfo>();
    const { username } = useParams<{ username: string }>();
    const { user, updateUser } = useUser();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        console.log("requesting user");
        if (username) {
            setIsAuthorized(user?.username === username);
            setIsLoading(true);
            getUserByUsername(username).then((res) => {
                const data = res.data;
                console.log(data);
                if (res.status !== 200) {
                    navigate("/error");
                } else {
                    setProfileUser({
                        id: data.id,
                        username: data.username,
                        displayName: data.displayname,
                        bio: data.bio,
                        pfp: data.pfp,
                        isAnonymous: false,
                        email: data.email,
                    });
                }
                setIsLoading(false);
            });
        }
    }, [username]);

    const handleTabClick = (tabLabel: tab) => {
        setActiveTab(tabLabel);
    };

    const handleClick = () => {
        setShowPopup(true);
    };

    const onClose = () => {
        setShowPopup(false);
    };

    const onCloseConfirmation = () => {
        setShowConfirmationPopup(false);
    }

    const onSaveEditProfile = (
        updatedDisplayName: string,
        updatedBio: string,
        updatedPfp: string,
    )=> {

        setShowPopup(false);
        setIsLoading(true);
        console.log(updatedDisplayName, updatedBio, updatedPfp);
        editCurrentUser({ displayname: updatedDisplayName, bio: updatedBio, pfp: updatedPfp }).then((res) => {
            console.log("edit result", res.status, res.data.message);
            if (res.status === 200) {
                setProfileUser(prev => prev && ({
                    ...prev,
                    displayName: updatedDisplayName,
                    bio: updatedBio,
                    pfp: updatedPfp,
                }))

                    if (user?.username === username) {
                        updateUser({
                            ...user,
                            displayName: updatedDisplayName,
                            bio: updatedBio,
                            pfp: updatedPfp,
                        });
                    }
                }
            window.location.reload();
            },
        );
    };

    const onSaveChangePassword = (
        currPass: string,
        newPass: string,
    ) : string | undefined => {
        setIsLoading(true);
        let data;
        changePassword(currPass, newPass).then(async (res) => {
                data = await res.json();
                if (res.status === 200) {
                    setShowPopup(false);
                    setShowConfirmationPopup(true);
                    setSuccess(true);
                    setIsLoading(false);
                }
            },
        )
        return data;
    };



    // console.log("user pfp", profileUser?.pfp);
    // console.log("user", profileUser);

    if (isLoading) {
        return <UserProfileSkeleton />;
    }

    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.userProfileHeader}>
                <div className={styles.userHeader}>
                    <div className={styles.userInfo}>
                        <div className={styles.top}>
                            <div className={styles.userAvatar}>
                                <ProfilePictureComponent source={profileUser?.pfp}/>
                            </div>
                            <div className={styles.names}>
                                <h3 className={styles.displayName}>
                                    {profileUser ? profileUser.displayName : ""}
                                </h3>
                                <h4 className={styles.username}>
                                    @{profileUser ? profileUser.username : ""}
                                </h4>
                            </div>
                        </div>
                        <p className={styles.userBio}>
                            {profileUser
                                ? profileUser.bio
                                    ? profileUser.bio
                                    : ""
                                : ""}
                        </p>
                    </div>
                    {isAuthorized ? (
                        <>
                            <button
                                className={`${styles.editProfileButton} ${styles.editProfileButtonLarge}`}
                                onClick={handleClick}
                            >
                                Edit Profile
                            </button>

                            <div
                             className={styles.editProfileButtonIcon}
                                onClick={handleClick}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 32 32"
                                     viewBox="0 0 32 32" id="edit" width={20} height={20}>
                                    <path
                                        d="M26.71002,0.94c-0.59003-0.59003-1.53003-0.59003-2.12,0L13.20001,12.32996c-0.17999,0.17004-0.29999,0.39001-0.38,0.63l-1.85999,6.21002c-0.16003,0.53003-0.01001,1.09998,0.38,1.48999c0.27997,0.29004,0.66998,0.44,1.06,0.44c0.13995,0,0.28998-0.02002,0.42999-0.06l6.20996-1.85999c0.24005-0.08002,0.46002-0.20001,0.63-0.38L31.06,7.40997C31.34003,7.13,31.5,6.75,31.5,6.34998c0-0.39996-0.15997-0.77997-0.44-1.06L26.71002,0.94z"></path>
                                    <path
                                        d="M30,14.5c-0.82861,0-1.5,0.67188-1.5,1.5v10c0,1.37891-1.12158,2.5-2.5,2.5H6c-1.37842,0-2.5-1.12109-2.5-2.5V6c0-1.37891,1.12158-2.5,2.5-2.5h10c0.82861,0,1.5-0.67188,1.5-1.5S16.82861,0.5,16,0.5H6C2.96729,0.5,0.5,2.96777,0.5,6v20c0,3.03223,2.46729,5.5,5.5,5.5h20c3.03271,0,5.5-2.46777,5.5-5.5V16C31.5,15.17188,30.82861,14.5,30,14.5z"></path>
                                </svg>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
                <ul className={styles.tabs}>
                    {isAuthorized
                        ? authTabs.map((tab) => (
                            <li
                                key={tab.label}
                                className={`${styles.tabElement} ${
                                    activeTab === tab.label
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => handleTabClick(tab.label)}
                            >
                                {tab.label}
                            </li>
                        ))
                        : tabs.map((tab) => (
                              <li
                                  key={tab.label}
                                  className={`${styles.tabElement} ${
                                      activeTab === tab.label
                                          ? styles.active
                                          : ""
                                  }`}
                                  onClick={() => handleTabClick(tab.label)}
                              >
                                  {tab.label}
                              </li>
                          ))}
                </ul>
            </div>

            <div className={styles.tabContent}>
                {activeTab === "Posts" ? (
                    <UserPosts />
                ) : activeTab === "Communities" ? (
                    <UserCommunities
                        id={profileUser?.id ? profileUser.id : -1}
                    />
                ) : activeTab === "Likes" ? (
                    <UserLikes />
                ) : (
                    <></>
                )}
            </div>
            {showPopup && (
                <EditUserPopUp
                    onClose={onClose}
                    currentProfilePicture={profileUser?.pfp}
                    currentDisplayName={
                        profileUser?.displayName ? profileUser.displayName : ""
                    }
                    currentBio={profileUser?.bio ? profileUser.bio : ""}
                    currentEmail={profileUser?.email ? profileUser.email : ""}
                    onSaveEditProfile={onSaveEditProfile}
                    onSaveChangePassword={onSaveChangePassword}
                    isLoading={isLoading}
                />
            )}

            {(showConfirmationPopup && (success ? (
                <ConfirmationPopUp confirmation={"Success!"}
                                   text={"Your password has been changed successfully!"}
                                   success={true}
                                   onClose={onCloseConfirmation}/>
            ) : (<ConfirmationPopUp confirmation={"Something Went Wrong"}
                                    text={"An error has occurred please try again"}
                                    success={false} onClose={onCloseConfirmation}/>)))}
        </div>
    );
}
