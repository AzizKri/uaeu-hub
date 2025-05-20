import styles from "./UserPreview.module.scss";
import { useNavigate } from "react-router-dom";
import React, {useEffect, useState} from "react";
import {inviteUserToCommunity, removeMemberFromCommunity} from "../../api/communities.ts";
import YesNoPopUp from "../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import ProfilePictureComponent from "../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";
import {useUser} from "../../contexts/user/UserContext.ts";

export default function UserPreview({
    communityId,
    profileUser,
    type,
    userStatus,
    removeMe,
    myRole,
}: {
    communityId: number;
    profileUser: UserInfo;
    type: "VIEW-MEMBERS" | "SEARCH-USERS";
    // admin & not-admin in case of view-members, member, invited & not-invited in case of search-users
    userStatus: "ADMIN" | "NOT-ADMIN" | "MEMBER" | "INVITED" | "NOT-INVITED";
    removeMe?: () => void;
    myRole: "Administrator" | "Member" | "Invited" | "no-role";
}) {
    const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
    const [btnTxt, setBtnTxt] = useState<"..." | "Invitation Sent" | "Invite" | "Member" | "Make Admin" | "Remove Admin" | "Default">("Default");
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        if (type === "VIEW-MEMBERS") {
            if (userStatus === "ADMIN") {
                setBtnTxt("Remove Admin")
            } else if (userStatus === "NOT-ADMIN") {
                setBtnTxt("Make Admin")
            }
        } else if (type === "SEARCH-USERS") {
            if (userStatus === "MEMBER") {
                setBtnTxt("Member");
            } else if (userStatus === "INVITED") {
                setBtnTxt("Invitation Sent");
            } else if (userStatus === "NOT-INVITED") {
                setBtnTxt("Invite");
            }
        }
    }, [type, userStatus]);

    const handleUserAction: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        if (type === "VIEW-MEMBERS") {
            if (userStatus === "ADMIN") { // action is remove admin
                // TODO: remove admin
                return;
            } else if (userStatus === "NOT-ADMIN") { // action is make admin
                // TODO: make admin
                return;
            }
        } else if (type === "SEARCH-USERS") {
            if (userStatus === "MEMBER" || userStatus == "INVITED") { // no action
                return;
            } else if (userStatus === "NOT-INVITED") { // action is invite
                setBtnTxt("...");
                inviteUserToCommunity(communityId, profileUser.id!).then((status) => {
                    console.log("invitation sent", status);
                    if (status === 200) {
                        setBtnTxt("Invitation Sent")
                    }
                })
            }
        }
    };

    const handleRemove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        setShowRemoveModal(true);
    };

    const removeMember = () => {
        if (profileUser.id)
            removeMemberFromCommunity(communityId, profileUser.id).then(
                (status) => {
                    if (status === 200) {
                        removeMe!();
                    } else {
                        console.log("Can not remove member, status: ", status);
                    }
                },
            );
    };

    return (
        <div
            className={styles.user}
            onClick={() => navigate(`/user/${profileUser.username}`)}
        >
            {showRemoveModal && (
                <YesNoPopUp
                    title={"Remove User"}
                    text={`Are you sure you want to remove @${profileUser.username}`}
                    onYes={removeMember}
                    onNo={() => null}
                    hidePopUp={() => setShowRemoveModal(false)}
                />
            )}
            <div className={styles.pfp}>
                <ProfilePictureComponent source={profileUser.pfp} />
            </div>
            <div className={styles.names}>
                <div className={styles.displayName}>
                    {profileUser.displayName}
                </div>
                <div className={styles.username}>@{profileUser.username}</div>
            </div>
            {
                myRole === "Administrator" &&
                profileUser.username !== user?.username && (
                    <div className={styles.btns}>
                        <div
                            className={`${styles.btn} ${styles.admin}`}
                            onClick={handleUserAction}
                        >
                            {btnTxt}
                        </div>
                        {type === "VIEW-MEMBERS" && userStatus === "NOT-ADMIN" && (
                            <div
                                className={`${styles.btn} ${styles.remove}`}
                                onClick={handleRemove}
                            >
                                Remove
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
}
