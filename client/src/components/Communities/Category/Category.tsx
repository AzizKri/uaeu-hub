import styles from "./Category.module.scss";
import {getCommunitiesByTag} from "../../../api/communities.ts";
import {useEffect, useState} from "react";
import ThreeDotsLine from "../../Reusable/Animations/ThreeDotsLine/ThreeDotsLine.tsx";
import CommunityPreview from "../CommunityPreview/CommunityPreview.tsx";

interface CommunityPreviewInfo {
    icon: string;
    name: string;
    id: number;
    members: number;
    isMember: boolean;
}

export default function Category({tag, joinedCommunity, setJoinedCommunity}: { tag: string, joinedCommunity: number, setJoinedCommunity: (id: number) => void}) {
    const [communities, setCommunities] = useState<CommunityPreviewInfo[]>([]);
    const [thereIsMore, setThereIsMore] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);

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

    useEffect(() => {
        setCommunities((prev: CommunityPreviewInfo[]) => (
            prev.map((com) => {
                if (com.id === joinedCommunity) {
                    return {...com, isMember: true};
                } else {
                    return com;
                }
            })
        ))
    }, [joinedCommunity]);

    // const handleJoinCommunity = (id: number) => {
    //     setJoinedCommunity(id);
    // }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>{tag}</h4>
            <div className={styles.communities}>
                {communities.map((com) => (
                    <CommunityPreview
                        key={com.id}
                        icon={com.icon}
                        name={com.name}
                        id={com.id}
                        members={com.members}
                        isMember={com.isMember}
                        onJoin={setJoinedCommunity}
                    />
                ))}
                {thereIsMore && (
                    <button
                        className={styles.showMore}
                        onClick={handleShowMore}
                    >
                        {isLoadingMore ? <ThreeDotsLine/> : "Show More"}
                    </button>
                )}
            </div>
        </div>
    );
}
