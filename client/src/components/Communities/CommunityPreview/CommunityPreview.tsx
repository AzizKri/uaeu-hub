import styles from "./CommunityPreview.module.scss";
import React, {useState} from "react";
import memberIcon from "../../../assets/account-outline-thin-dot.svg";
import ThreeDotsLine from "../../Reusable/Animations/ThreeDotsLine/ThreeDotsLine.tsx";
import {joinCommunity} from "../../../api/communities.ts";
import {useNavigate} from "react-router-dom";
import CommunityIconComponent from "../../Reusable/CommunityIconComponent/CommunityIconComponent.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";

export default function CommunityPreview({
    icon,
    name,
    id,
    members,
    isMember,
    onJoin,
}: CommunityPreviewProps) {
    const { isUser } = useUser();
    const navigate = useNavigate();
    const [isJoining, setIsJoining] = useState<boolean>(false);

    const handleClickCommunity = (name: string) => {
        navigate(`/community/${name}`);
    }

    const handleJoinCommunity = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
        e.stopPropagation();
        setIsJoining(true);
        joinCommunity(id).then((status) => {
            if (status === 200 && onJoin) {
                onJoin(id);
            }
        }).finally(() => {
            setIsJoining(false);
        })
    }

    return (
        <div
            key={id}
            className={styles.communityPreview}
            onClick={() => handleClickCommunity(name)}
        >
            <div className={styles.communityIcon}>
                <CommunityIconComponent source={icon} />
            </div>
            <div className={styles.info}>
                <h4 className={styles.communityName}>{name}</h4>
                <div className={styles.members}>
                    <img src={memberIcon} alt="member" />
                    {members}
                </div>
            </div>
            {isUser() && !isMember && (
                <button
                    className={styles.join}
                    onClick={(e) => handleJoinCommunity(e, id)}
                >
                    {isJoining ? <ThreeDotsLine /> : "Join"}
                </button>
            )}
        </div>
    );
}
