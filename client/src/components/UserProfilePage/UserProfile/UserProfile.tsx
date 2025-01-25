import { useEffect, useState } from "react";
import styles from "./UserProfile.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { getUserByUsername } from "../../../api/users.ts";
import { useUser } from "../../../lib/utils/hooks.ts";
import defaultProfilePicture from "../../../assets/profile-picture.png";
import EditUserPopUp from "../EditUserPopUp/EditUserPopUp.tsx";
import UserPosts from "../UserPosts/UserPosts.tsx";
import UserCommunities from "../UserCommunities/UserCommunities.tsx";
import UserLikes from "../UserLikes/UserLikes.tsx";
import { assetsBase } from "../../../api/api.ts";
import { editCurrentUser } from "../../../api/currentUser.ts";

const authTabs = [
    { label: "Posts" },
    { label: "Communities" },
    { label: "Likes" },
];

const tabs = [{ label: "Posts" }, { label: "Communities" }];

export default function UserProfile() {
    const [showPopup, setShowPopup] = useState(false);
    const [activeTab, setActiveTab] = useState("");
    const [profileUser, setProfileUser] = useState<UserInfo>();
    const { username } = useParams<{ username: string }>();
    const { user, updateUser } = useUser();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    useEffect(() => {
        setActiveTab("Posts");
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

    const handleTabClick = (tabLabel: string) => {
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
        console.log("saving this information");
        console.log("updatedDisplayName", updatedDisplayName);
        console.log("updatedBio", updatedBio);
        console.log("updatedPfp", updatedPfp);

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

    console.log("user pfp", profileUser?.pfp);
    console.log("user", profileUser);

    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.userProfileHeader}>
                <div className={styles.userHeader}>
                    <div className={styles.userInfo}>
                        <div className={styles.top}>
                            <div className={styles.userAvatar}>
                                <img
                                    className={styles.pfp}
                                    src={
                                        profileUser?.pfp
                                            ? profileUser.pfp.startsWith("http")
                                                ? profileUser.pfp
                                                : `${assetsBase}/pfp/${profileUser.pfp}`
                                            : defaultProfilePicture
                                    }
                                    alt="profile picture"
                                />
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
