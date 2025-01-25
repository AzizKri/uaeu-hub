import styles from "./UserPreview.module.scss";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { removeMemberFromCommunity } from "../../api/communities.ts";
import YesNoPopUp from "../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import ProfilePictureComponent from "../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";

export default function UserPreview({
    communityId,
    user,
    type,
    removeMe,
    role,
}: {
    communityId: number;
    user: UserInfo;
    type?: "ADMIN" | "MEMBER";
    removeMe: () => void;
    role?: "Administrator" | "Member"
}) {
    const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleAdmin: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
    };

    const handleRemove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        setShowRemoveModal(true);
    };

    const removeMember = () => {
        if (user.id)
            removeMemberFromCommunity(communityId, user.id).then((status) => {
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
            onClick={() => navigate(`/user/${user.username}`)}
        >
            {showRemoveModal && (
                <YesNoPopUp
                    title={"Remove User"}
                    text={`Are you sure you want to remove @${user.username}`}
                    onYes={removeMember}
                    onNo={() => null}
                    hidePopUp={() => setShowRemoveModal(false)}
                />
            )}
            <div className={styles.pfp}>
                <ProfilePictureComponent source={user.pfp} />
            </div>
            <div className={styles.names}>
                <div className={styles.displayName}>{user.displayName}</div>
                <div className={styles.username}>@{user.username}</div>
            </div>
            {type && role && role === "Administrator" && (
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
