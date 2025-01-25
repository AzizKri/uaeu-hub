import styles from "./Header.module.scss";
import OptionsMenu from "../OptionsMenu/OptionsMenu.tsx";
import React from "react";
import {useNavigate} from "react-router-dom";
import ProfilePictureComponent from "../../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";
import CommunityIconComponent from "../../Reusable/CommunityIconComponent/CommunityIconComponent.tsx";

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
                        <div className={styles.user_icon_no_community}>
                            <ProfilePictureComponent source={userIcon} />
                        </div>
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
                        <div onClick={goToCommunity} className={styles.community_icon}>
                            <CommunityIconComponent source={communityIcon} />
                        </div>
                        <div className={styles.user_icon}>
                            <ProfilePictureComponent source={userIcon} />
                        </div>
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
