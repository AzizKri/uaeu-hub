import React, {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import CommunityPreview from "../../Communities/CommunityPreview/CommunityPreview.tsx";
import styles from "../UserContent.module.scss";
import {getUserCommunities} from "../../../api/users.ts";

export default function UserCommunities() {
    const [userCommunities, setUserCommunities] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { username } =  useParams<{ username: string }>();
    const location = useLocation();

    useEffect(() => {
        if (!username) return;
        setIsLoading(true);
        try {
            getUserCommunities(location?.state?.data?.user_id).then((res) => {
                // console.log("profileUser posts results", res);
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
