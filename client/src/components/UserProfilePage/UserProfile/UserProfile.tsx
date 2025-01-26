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

    useEffect(() => {
        console.log("requesting user");
        if (username) {
            setIsAuthorized(user?.username === username);
            getUserByUsername(username).then((res) => {
                const data = res.data;
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
                    });
                }
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

    const onSave = (
        updatedDisplayName: string,
        updatedBio: string,
        updatedPfp: string,
    ) => {

        setShowPopup(false);
        editCurrentUser({ displayname: updatedDisplayName, bio: updatedBio, pfp: updatedPfp }).then((res) => {
            console.log("edit result", res.status)
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
            },
        );
    };

    // console.log("user pfp", profileUser?.pfp);
    // console.log("user", profileUser);

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
                        <button
                            className={styles.editProfileButton}
                            onClick={handleClick}
                        >
                            Edit Profile
                        </button>
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
                    onSave={onSave}
                />
            )}
        </div>
    );
}
