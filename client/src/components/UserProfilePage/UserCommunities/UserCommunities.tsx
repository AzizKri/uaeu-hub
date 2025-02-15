import React, {useEffect, useState} from "react";
import CommunityPreview from "../../Communities/CommunityPreview/CommunityPreview.tsx";
import styles from "../UserContent.module.scss";
import {getUserCommunities} from "../../../api/users.ts";
import Skeleton from "../../Reusable/Skeleton/Skeleton.tsx";

export default function UserCommunities({id} : {id : number}) {
    const [userCommunities, setUserCommunities] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        getUserCommunities(id).then((res) => {
            if (res.data.length == 0) {
                setIsLoading(false);
                return;
            }
            const data = res.data;
            console.log(data);
            const fetchedCommunities: React.ReactElement[] = []
            for (const idx of data) {
                console.log(idx);
                const communityInfo: CommunityPreviewProps = {
                    icon: idx.icon,
                    name: idx.name,
                    id: idx.id,
                    members: idx.member_count,
                    isMember: idx.is_member,
                };
                fetchedCommunities.push(
                    <CommunityPreview
                        key={idx.id}
                        {...communityInfo}
                    />
                );
            }
            setUserCommunities(fetchedCommunities);
        })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return isLoading ? (
        <>
            <Skeleton type={"community"} />
        </>
    ) : (
        <>
            <div className={styles.userCommunitiesContainer}>
                {userCommunities}
            </div>
        </>
    )
}
