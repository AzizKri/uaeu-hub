import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getCommunitiesCurrentUser} from "../../../api/currentUser.ts";
import CommunityPreview from "../../Communities/CommunityPreview/CommunityPreview.tsx";
import styles from "../UserContent.module.scss";

export default function UserCommunities() {
    const [userCommunities, setUserCommunities] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { username } =  useParams<{ username: string }>();

    useEffect(() => {
        if (!username) return;
        setIsLoading(true);
        try {
            getCommunitiesCurrentUser().then((res) => {
                // console.log("profileUser posts results", res);
                if (res.data.length == 0) {
                    setIsLoading(false);
                    return;
                }
                const data = res.data;
                const fetchedCommunities: React.ReactElement[] = []
                for (const idx of data) {
                    console.log(idx);
                    const communityInfo: CommunityPreviewProps = {
                        icon: idx.icon,
                        name: idx.name,
                        id: idx.id,
                        members: idx.member_count
                    };
                    fetchedCommunities.push(
                        <CommunityPreview
                            {...communityInfo}
                        />
                    );
                }
                setUserCommunities(fetchedCommunities);
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    return (
        <>
            <div className={styles.userCommunitiesContainer}>
                {userCommunities}
            </div>
            {isLoading && <span>Loading...</span>}
        </>
    )
}
