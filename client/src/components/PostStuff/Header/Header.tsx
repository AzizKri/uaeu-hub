import styles from "./Header.module.scss";
import profilePicture from "../../../assets/profile-picture.png";
import defaultCommunityIcon from "../../../assets/community-icon.jpg";
import OptionsMenu from "../OptionsMenu/OptionsMenu.tsx";
import React from "react";
import {useNavigate} from "react-router-dom";

interface HeaderProps {
    type: "COMMUNITY+DISPLAYNAME" | "DISPLAYNAME+USERNAME";
    community?: string;
    username: string;
    displayName: string;
    timeText: string;
    userIcon?: string;
    communityIcon?: string;
    postId: number
}

export default function Header({
    type,
    community,
    username,
    displayName,
    timeText,
    userIcon,
    communityIcon,
    postId,
}: HeaderProps) {
    const navigate = useNavigate();

    const goToAuthor: React.MouseEventHandler = (e) => {
        e.stopPropagation()
        navigate(`/user/${username}`);
    }

    const goToCommunity: React.MouseEventHandler = (e) => {
        e.stopPropagation()
        navigate(`/community/${community}`);
    }

    return (
        <div className={styles.post__info_bar}>
            {type === "DISPLAYNAME+USERNAME" ? (
                <>
                    <div className={styles.pics}>
                        <img
                            src={
                                userIcon == undefined
                                    ? profilePicture
                                    : userIcon
                            }
                            alt="profile picture"
                            className={styles.user_icon_no_community}
                            onClick={goToAuthor}
                        />
                    </div>
                    <div className={styles.names}>
                        <div className={styles.mainName}>
                            <span onClick={goToAuthor}>
                                {displayName}
                            </span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.timeText}>{timeText}</span>
                        </div>
                        <div
                            className={styles.secondaryName}
                            onClick={goToAuthor}
                        >@{username}</div>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.pics}>
                        <img
                            src={
                                communityIcon == undefined
                                    ? defaultCommunityIcon
                                    : communityIcon
                            }
                            alt="community icon"
                            className={styles.community_icon}
                            onClick={goToCommunity}
                        />
                        <img
                            src={
                                userIcon == undefined
                                    ? profilePicture
                                    : userIcon
                            }
                            alt="profile picture"
                            className={styles.user_icon}
                            onClick={goToAuthor}
                        />
                    </div>
                    <div className={styles.names}>
                        <div
                            className={styles.mainName}
                            onClick={goToCommunity}
                        >
                            {community}
                        </div>
                        <div>
                            <span onClick={goToAuthor} className={styles.secondaryName}>
                                {displayName}
                            </span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.timeText}>{timeText}</span>
                        </div>
                    </div>
                </>
            )}
            <div className={styles.post__info_bar__dots}>
                <OptionsMenu
                    type="POST"
                    id={postId}
                    author={username}
                />
            </div>
        </div>
    );
}
