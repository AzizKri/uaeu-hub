import styles from "./UserPreview.module.scss";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { removeMemberFromCommunity } from "../../api/communities.ts";
import YesNoPopUp from "../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import ProfilePictureComponent from "../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";
import {useUser} from "../../lib/utils/hooks.ts";

export default function UserPreview({
    communityId,
    profileUser,
    type,
    removeMe,
    role,
}: {
    communityId: number;
    profileUser: UserInfo;
    type?: "ADMIN" | "MEMBER";
    removeMe: () => void;
    role?: "Administrator" | "Member"
}) {
    const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const {user} = useUser();

    const handleAdmin: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
    };

    const handleRemove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        setShowRemoveModal(true);
    };

    const removeMember = () => {
        if (profileUser.id)
            removeMemberFromCommunity(communityId, profileUser.id).then((status) => {
                if (status === 200) {
                    removeMe();
                } else {
                    console.log("Can not remove member, status: ", status);
                }
            });
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
                <div className={styles.displayName}>{profileUser.displayName}</div>
                <div className={styles.username}>@{profileUser.username}</div>
            </div>
            {type && role && role === "Administrator" && profileUser.username !== user?.username && (
                <div className={styles.btns}>
                    <div
                        className={`${styles.btn} ${styles.admin}`}
                        onClick={handleAdmin}
                    >
                        {type === "ADMIN" ? "Remove Admin" : "Make Admin"}
                    </div>
                    {type === "MEMBER" && (
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
