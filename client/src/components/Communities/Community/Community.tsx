import styles from "./Community.module.scss";
import pfp from "../../../assets/community-icon.jpg"
import React, {useEffect, useState} from "react";
import profilePicture from "../../../assets/profile-picture.png";
import {Link, useParams} from "react-router-dom";
import {
    getMembersOfCommunity,
    getCommunityByName,
    joinCommunity,
    getAdminsOfCommunity,
    leaveCommunity
} from "../../../api/communities.ts";
import LoadingImage from "../../Reusable/LoadingImage/LoadingImage.tsx";
import {useUser} from "../../../lib/utils/hooks.ts";
import Popup from "../../Reusable/Popup/Popup.tsx";
import Editor from "../../PostStuff/Editor/Editor.tsx";

// export default function Community({info}: {info: CommunityInfo}) {
export default function Community() {
    // TODO: replace by getCommunityPosts() once it is implemented
    // const {posts} = useUpdatePosts();
    const { communityName } = useParams<{ communityName: string }>(); // Get the postId from the URL
    const [info, setInfo] = useState<CommunityInfo>();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<"POST" | "ABOUT" | "MEMBER">("POST");
    const [members, setMembers] = useState<UserInfo[]>([]);
    const [admins, setAdmins] = useState<UserInfo[]>([]);
    const [posts, setPosts] = useState<React.ReactElement[]>([]);
    const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const {isUser} = useUser();

    useEffect(() => {
        if (communityName) {
            getCommunityByName(communityName).then((res) => {
                console.log("community info", res.data);
                setIsMember(res.data.is_member);
                setInfo({
                    id: res.data.id,
                    name: res.data.name,
                    description: res.data.description,
                    icon: res.data.icon,
                    verified: res.data.verified,
                    inviteOnly: res.data.invite_only,
                    createdAt: new Date(res.data.created_at),
                    tags: res.data.tags,
                    memberCount: res.data.member_count,
                    public: res.data.public,
                });
                setLoadingInfo(false);
            })
        }
    }, [communityName]);

    useEffect(() => {
        if (info) {
            setAdmins([
                {displayName: "Display Name 1", username: "username1"},
                {displayName: "Display Name 2", username: "username2"},
                {displayName: "Display Name 3", username: "username3"}
            ]);
            getMembersOfCommunity(info.id).then(res => setMembers(res.data));
            getAdminsOfCommunity(info.id).then(res => setAdmins(res.data));
        }
    }, [info]);

    const handleJoinLeave = () => {
        if (info) {
            if (isMember) {
                leaveCommunity(info.id).then((res) => {
                    if (res === 200) setIsMember(false);
                })
            } else {
                joinCommunity(info.id).then((res) => {
                    if (res === 200) setIsMember(true);
                })
            }
        }
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
    const handleCreatePost = () => {
        setShowEditor(true);
    }
    const prependPost = (post: React.ReactElement) => {
        setPosts((prev) => [...prev, post]);
    }

    return (loadingInfo || !info ? (
        <LoadingImage width={"200px"}/>
    ) : (
        <div className={styles.container}>
            {showEditor &&
                <Popup hidePopUp={() => setShowEditor(false)}>
                    <Editor
                        type="post"
                        prependPost={prependPost}
                        communityId={info.id}
                    />
                </Popup>
            }
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
                        {isMember && (
                            <button
                                className={styles.create}
                                onClick={handleCreatePost}
                            >
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
                        )}
                        {isUser() && (
                            <button
                                className={styles.join}
                                onClick={handleJoinLeave}
                            >
                                {isMember ? "Leave" : "Join"}
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
                    posts && posts.length > 0 ? (
                        <div className={styles.posts}>{posts}</div>
                    ) : (
                        <p className={styles.message}>There are no posts yet in this community</p>
                    )
                ) : activeTab === "ABOUT" ? (
                    <div className={styles.about}>
                        <div className={styles.info}>
                            <h5>Created</h5>
                            <p>{info.createdAt.toDateString()}</p>
                        </div>
                        <div className={styles.info}>
                            <h5>Members</h5>
                            <p>{info.memberCount}</p>
                        </div>
                        <div className={styles.info}>
                            <h5>Description</h5>
                            <p>{info.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.members}>
                        <div className={styles.category}>
                            <h5 className={styles.membersInfo}>Admins</h5>
                            {admins && admins.length > 0 ? (
                            <ul className={styles.users}>
                                {admins.map((ad) => (
                                    <li key={ad.username}>
                                        <UserPreview user={ad}/>
                                    </li>
                                ))}
                            </ul>
                            ) : (
                                <p className={styles.message}>No Admins</p>
                            )}
                        </div>
                            <div className={styles.category}>
                                <h5 className={styles.membersInfo}>Members</h5>
                                {members && members.length > 0 ? (
                                <ul className={styles.users}>
                                    {members.map((mem) => (
                                        <li key={mem.username}>
                                            <UserPreview user={mem}/>
                                        </li>
                                    ))}
                                </ul>
                                ) : (
                                    <p className={styles.message}>No members</p>
                                )}
                            </div>
                    </div>
                )}
            </div>
        </div>
        )
    );
}

function UserPreview({user}: { user: UserInfo }) {
    return (
        <Link to={`/user/${user.username}`}>
            <div className={styles.user}>
                <img className={styles.pfp} src={user.pfp ? user.pfp : profilePicture} alt="user profile picture"/>
                <div className={styles.names}>
                    <div className={styles.displayName}>{user.displayName}</div>
                    <div className={styles.username}>@{user.username}</div>
                </div>
            </div>
        </Link>
    )
}
