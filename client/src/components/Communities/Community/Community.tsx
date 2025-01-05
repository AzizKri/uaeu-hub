import styles from "./Community.module.scss";
import pfp from "../../../assets/community-icon.jpg"
import {useUpdatePosts} from "../../../lib/hooks.ts";
import {useEffect, useState} from "react";

export default function Community({info}: {info: CommunityInfo}) {
    // TODO: replace by getCommunityPosts() once it is implemented
    const {posts} = useUpdatePosts();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<"POST" | "ABOUT" | "MEMBER">("POST");
    const [members, setMembers] = useState<UserInfo[]>([]);
    const [admins, setAdmins] = useState<UserInfo[]>([]);
    // const [posts, setPosts] = useState<CommunityInfo[]>([]);

    useEffect(() => {
        setAdmins([
            {displayName: "Display Name 1", username: "username1"},
            {displayName: "Display Name 2", username: "username2"},
            {displayName: "Display Name 3", username: "username3"}
        ]);
        setMembers([
            {displayName: "Display Name 4", username: "username4"},
            {displayName: "Display Name 5", username: "username5"},
            {displayName: "Display Name 6", username: "username6"},
            {displayName: "Display Name 7", username: "username7"},
            {displayName: "Display Name 8", username: "username8"},
            {displayName: "Display Name 9", username: "username9"},
            {displayName: "Display Name 10", username: "username10"}
        ])
    }, []);

    const joinCommunity = () => {
        // TODO: need a function to add users to communities
        setIsMember(true);
    }

    const handlePosts = () => {
        setActiveTab("POST");
    }
    const handleAbout = () => {
        setActiveTab("ABOUT");
    }
    const handleMembers= () => {
        setActiveTab("MEMBER");
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.header_top}>
                    <div className={styles.info}>
                        <img
                            className={styles.icon}
                            src={pfp}
                            alt="Community Icon"
                        />
                        <div className={styles.community_name}>{info.name}</div>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.create}>
                            {/*plus icon*/}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24px"
                                height="24px"
                                fill="currentColor"
                            >
                                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                            </svg>
                            Create Post
                        </button>
                        {!isMember && (
                            <button
                                className={styles.join}
                                onClick={joinCommunity}
                            >
                                Join
                            </button>
                        )}
                    </div>
                </div>
                {/*<p className={styles.description}>{info.description}</p>*/}
            </div>
            <ul className={styles.tabs}>
                <li className={`${styles.tab} ${(activeTab === "POST") && styles.active}`} onClick={handlePosts}>Posts</li>
                <li className={`${styles.tab} ${activeTab === "ABOUT" && styles.active}`} onClick={handleAbout}>About</li>
                <li className={`${styles.tab} ${activeTab === "MEMBER" && styles.active}`} onClick={handleMembers}>Members</li>
            </ul>
            <div className={styles.main}>
                {activeTab === "POST" ? (
                    <div className={styles.posts}>{posts}</div>
                ) : activeTab === "ABOUT" ? (
                    <div className={styles.about}>
                        <div className={styles.info}>
                            <div>Created</div>
                            <div>{info.createdAt.toDateString()}</div>
                        </div>
                        <div className={styles.info}>
                            <div>Members</div>
                            <div>{info.memberCount}</div>
                        </div>
                        <div className={styles.info}>
                            <div>Description</div>
                            <div>{info.description}</div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.membesrs}>
                        <div className={styles.category}>
                            <div className={styles.membersInfo}>Admins</div>
                            <ul className={styles.users}>
                                {admins.map((ad) => (
                                    <li key={ad.username}>
                                        <UserPreview user={ad}/>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.category}>
                            <div className={styles.membersInfo}>Members</div>
                            <ul className={styles.users}>
                                {members.map((mem) => (
                                    <li key={mem.username}>
                                        <UserPreview user={mem}/>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserPreview({user}: { user: UserInfo }) {
    return (
        <div className={styles.user}>
            <img className={styles.pfp} src={user.pfp} alt="user profile picture"/>
            <div className={styles.names}>
                <div className={styles.displayName}>{user.displayName}</div>
                <div className={styles.username}>{user.username}</div>
            </div>
        </div>
    )
}
