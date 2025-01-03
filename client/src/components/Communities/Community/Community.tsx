import styles from "./Community.module.scss";
import pfp from "../../../assets/community-icon.jpg"
import {useUpdatePosts} from "../../../lib/hooks.ts";
import {useState} from "react";

export default function Community({info}: {info: CommunityInfo}) {
    // TODO: replace by getCommunityPosts() once it is implemented
    const {posts} = useUpdatePosts();
    const [isMember, setIsMember] = useState<boolean>(false);

    const joinCommunity = () => {
        // TODO: need a function to add users to communities
        setIsMember(true);
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.header_top}>
                    <div className={styles.info}>
                        <img className={styles.icon} src={pfp} alt="Community Icon"/>
                        <div className={styles.community_name}>{info.name}</div>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.create}>
                            {/*plus icon*/}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"
                                 fill="currentColor">
                                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                            </svg>
                            Create Post
                        </button>
                        {!isMember && <button className={styles.join} onClick={joinCommunity}>Join</button>}
                    </div>
                </div>
                <p className={styles.pio}>{info.description}</p>
            </div>
            <div className={styles.main}>
                <div className={styles.posts}>
                    {posts}
                </div>
            </div>
        </div>
    )
}
