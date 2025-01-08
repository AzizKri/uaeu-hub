import styles from "./Category.module.scss";
import { getCommunitiesByTag, joinCommunity } from "../../../api/communities.ts";
import memberIcon from "../../../assets/account-outline-thin-dot.svg";
import { useEffect, useState } from "react";
import LoaderDots from "../../Reusable/LoaderDots/LoaderDots.tsx";
import {useUser} from "../../../lib/utils/hooks.ts";

interface CommunityPreview {
    icon: string;
    name: string;
    id: number;
    members: number;
    isMember: boolean;
}

export default function Category({ tag }: { tag: string }) {
    const [communities, setCommunities] = useState<CommunityPreview[]>([]);
    const [thereIsMore, setThereIsMore] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const {isUser} = useUser();

    useEffect(() => {
        getCommunitiesByTag(tag).then((res) => {
            setThereIsMore(res.data.length === 10);
            setCommunities(
                res.data.map(
                    ({
                        icon,
                        name,
                        id,
                        member_count,
                        is_member,
                    }: {
                        icon: string;
                        name: string;
                        id: number;
                        member_count: number;
                        is_member: boolean;
                    }) => ({
                        icon: icon,
                        name: name,
                        id: id,
                        members: member_count,
                        isMember: is_member,
                    }),
                ),
            );
        });
    }, [tag]);

    const handleShowMore = () => {
        setIsLoadingMore(true);
        getCommunitiesByTag(tag, page).then((res) => {
            setThereIsMore(res.data.length === 10);
            setCommunities((prev) => [
                ...prev,
                ...res.data.map(
                    ({
                        icon,
                        name,
                        id,
                        member_count,
                        is_member,
                    }: {
                        icon: string;
                        name: string;
                        id: number;
                        member_count: number;
                        is_member: boolean;
                    }) => ({
                        icon: icon,
                        name: name,
                        id: id,
                        members: member_count,
                        isMember: is_member,
                    }),
                ),
            ]);
            setIsLoadingMore(false);
        });
        setPage((prev) => prev + 1);
    };

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>{tag}</h4>
            <div className={styles.communities}>
                {communities.map((com) => (
                    <div key={com.id} className={styles.communityPreview}>
                        <img
                            src={com.icon}
                            alt={`${com.name} Community`}
                            className={styles.communityIcon}
                        />
                        <div className={styles.info}>
                            <h4 className={styles.communityName}>
                                {com.name}
                            </h4>
                            <div className={styles.members}>
                                <img src={memberIcon} alt="member" />
                                {com.members}
                            </div>
                        </div>
                        {isUser() && !com.isMember && (
                            <button
                                className={styles.join}
                                onClick={() => joinCommunity(com.id)}
                            >
                                Join
                            </button>
                        )}
                    </div>
                ))}
                {thereIsMore && (
                    <button
                        className={styles.showMore}
                        onClick={handleShowMore}
                    >
                        {isLoadingMore ? <LoaderDots /> : "Show More"}
                    </button>
                )}
            </div>
        </div>
    );
}
