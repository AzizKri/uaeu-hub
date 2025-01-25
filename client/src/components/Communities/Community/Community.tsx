import styles from "./Community.module.scss";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    deleteCommunity,
    getCommunityByName,
    getLatestCommunityPosts,
    getMembersOfCommunity,
    joinCommunity,
    leaveCommunity,
} from "../../../api/communities.ts";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";
import { useUser } from "../../../lib/utils/hooks.ts";
import Modal from "../../Reusable/Modal/Modal.tsx";
import Editor from "../../PostStuff/Editor/Editor.tsx";
import arrowRight from "../../../assets/chevron-right.svg";
import CreateCommunity from "../CreateCommunity/CreateCommunity.tsx";
import UserPreview from "../../UserPreview/UserPreview.tsx";
import Post from "../../PostStuff/Post/Post.tsx";
import YesNoPopUp from "../../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import CommunityIconComponent from "../../Reusable/CommunityIconComponent/CommunityIconComponent.tsx";

// export default function Community({info}: {info: CommunityInfo}) {
export default function Community() {
    // TODO: replace by getCommunityPosts() once it is implemented
    const { communityName } = useParams<{ communityName: string }>(); // Get the postId from the URL
    const [info, setInfo] = useState<CommunityInfo>();
    const [role, setRole] = useState<"Administrator" | "Member">();
    const [activeTab, setActiveTab] = useState<
        "POST" | "ABOUT" | "MEMBER" | "SETTINGS"
    >("POST");
    const [allMembers, setAllMembers] = useState<UserInfo[]>([]);
    const [members, setMembers] = useState<UserInfo[]>([]);
    const [admins, setAdmins] = useState<UserInfo[]>([]);
    const [posts, setPosts] = useState<React.ReactElement[]>([]);
    const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [showCommunityEditor, setShowCommunityEditor] =
        useState<boolean>(false);
    const { isUser } = useUser();
    const [searchMembersVal, setSearchMembersVal] = useState<string>("");
    const [showSearchMembersModal, setShowSearchMembersModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    useEffect(() => {
        if (communityName) {
            getCommunityByName(communityName).then((res) => {
                setRole(res.data.role);
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
            });
        }
    }, [communityName]);

    useEffect(() => {
        if (info) {
            getLatestCommunityPosts(info.id).then((res) => {
                setPosts(
                    res.data.map(
                        (post: {
                            id: number;
                            author: string;
                            displayname: string;
                            post_time: string | number | Date;
                            content: string;
                            pfp: string;
                            attachment: string;
                            like_count: number;
                            comment_count: number;
                            liked: boolean;
                        }) => (
                            <Post
                                key={post.id}
                                postInfo={{
                                    id: post.id,
                                    authorUsername: post.author,
                                    authorDisplayName: post.displayname,
                                    postDate: new Date(post.post_time),
                                    content: post.content,
                                    pfp: post.pfp,
                                    filename: post.attachment,
                                    likeCount: post.like_count,
                                    commentCount: post.comment_count,
                                    type: "NO_COMMUNITY",
                                    liked: post.liked,
                                }}
                            />
                        ),
                    ),
                );
            });
        }
    }, [info]);

    useEffect(() => {
        setMembers(
            allMembers.filter(
                (mem: UserInfo) =>
                    mem.role === "Member" &&
                    (mem.username
                        .toLowerCase()
                        .includes(searchMembersVal.toLowerCase()) ||
                        mem.displayName
                            .toLowerCase()
                            .includes(searchMembersVal.toLowerCase())),
            ),
        );
        setAdmins(
            allMembers.filter(
                (mem: UserInfo) =>
                    mem.role === "Administrator" &&
                    (mem.username
                        .toLowerCase()
                        .includes(searchMembersVal.toLowerCase()) ||
                        mem.displayName
                            .toLowerCase()
                            .includes(searchMembersVal.toLowerCase())),
            ),
        );
    }, [allMembers, searchMembersVal]);

    const handleJoinLeave = () => {
        if (info) {
            if (role) {
                leaveCommunity(info.id).then((res) => {
                    if (res === 200) setRole(undefined);
                });
            } else {
                joinCommunity(info.id).then((res) => {
                    if (res === 200) setRole("Member");
                });
            }
        }
    };

    const handlePosts = () => {
        setActiveTab("POST");
    };
    const handleAbout = () => {
        setActiveTab("ABOUT");
    };
    const handleMembers = () => {
        if (info) {
            getMembersOfCommunity(info.id).then((res) => {
                setAllMembers(res.data);
            });
        }
        setActiveTab("MEMBER");
    };
    const handleSettings = () => {
        setActiveTab("SETTINGS");
    };

    const handleCreatePost = () => {
        setShowEditor(true);
    };
    const prependPost = (post: React.ReactElement) => {
        setPosts((prev) => [...prev, post]);
    };
    const handleEditCommunity = () => {
        setShowCommunityEditor(true);
    };
    const handleCloseEditCommunity = () => {
        setShowCommunityEditor(false);
    };
    const handleSearchMembers: React.ChangeEventHandler<HTMLInputElement> = (
        e,
    ) => {
        setSearchMembersVal(e.target.value);
    };
    const removeUser = (id: number) => {
        setMembers(prev => (
            prev.filter(mem => mem.id !== id)
        ))
    }

    const handleCloseInviteModal = () => {
        // TODO: complete this (what ever it is)
        return null;
    }

    const handleInviteMembers = () => {
        setShowSearchMembersModal(true);
    }

    const handleDeleteCommunity = () => {
        if (info) deleteCommunity(info.id).then(() => {
            // console.log('community deleted:', res);
            window.location.replace('/');
        })
    }

    return loadingInfo || !info ? (
        <LineSpinner width={"200px"} />
    ) : (
        <div className={styles.container}>
            {showEditor && (
                <Modal onClose={() => setShowEditor(false)}>
                    <Editor
                        type="POST"
                        prependPost={prependPost}
                        communityId={info.id}
                    />
                </Modal>
            )}
            <div className={styles.header}>
                <div className={styles.header_top}>
                    <div className={styles.info}>
                        <div className={styles.icon}>
                            <CommunityIconComponent source={info.icon}/>
                        </div>
                        <div className={styles.community_name}>{info.name}</div>
                    </div>
                    <div className={styles.actions}>
                        {role && (
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
                                {role ? "Leave" : "Join"}
                            </button>
                        )}
                    </div>
                </div>
                {/*<p className={styles.description}>{info.description}</p>*/}
            </div>
            <ul className={styles.tabs}>
                <li
                    className={`${styles.tab} ${activeTab === "POST" && styles.active}`}
                    onClick={handlePosts}
                >
                    Posts
                </li>
                <li
                    className={`${styles.tab} ${activeTab === "ABOUT" && styles.active}`}
                    onClick={handleAbout}
                >
                    About
                </li>
                <li
                    className={`${styles.tab} ${activeTab === "MEMBER" && styles.active}`}
                    onClick={handleMembers}
                >
                    Members
                </li>
                {role === "Administrator" && (
                    <li
                        className={`${styles.tab} ${activeTab === "SETTINGS" && styles.active}`}
                        onClick={handleSettings}
                    >
                        Settings
                    </li>
                )}
            </ul>
            <div className={styles.main}>
                {activeTab === "POST" ? (
                    posts && posts.length > 0 ? (
                        <div className={styles.posts}>{posts}</div>
                    ) : (
                        <p className={styles.message}>
                            There are no posts yet in this community
                        </p>
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
                ) : activeTab === "MEMBER" ? (
                    <div className={styles.members}>
                        <label
                            htmlFor="searchMembersInput"
                            className={styles.searchMembersLabel}
                        >
                            <input
                                id="searchMembersInput"
                                type="text"
                                value={searchMembersVal}
                                onChange={handleSearchMembers}
                                placeholder="Search Members"
                                className={styles.searchMembers}
                            />
                            <span
                                className={styles.clear}
                                onClick={() => setSearchMembersVal("")}
                            >
                                ×
                            </span>
                        </label>
                        <div className={styles.category}>
                            <h5 className={styles.membersInfo}>Admins</h5>
                            {admins && admins.length > 0 ? (
                                <ul className={styles.users}>
                                    {admins.map((ad) => (
                                        <li key={ad.username}>
                                            <UserPreview
                                                communityId={info.id}
                                                user={ad}
                                                type="ADMIN"
                                                removeMe={() => ad.id && removeUser(ad.id)}
                                                role={role}
                                            />
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
                                            <UserPreview
                                                communityId={info.id}
                                                user={mem}
                                                type="MEMBER"
                                                removeMe={() => mem.id && removeUser(mem.id)}
                                                role={role}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.message}>No members</p>
                            )}
                        </div>
                    </div>
                ) : activeTab === "SETTINGS" ? (
                    <ul className={styles.settings}>
                        <li
                            className={styles.setting}
                            onClick={handleEditCommunity}
                        >
                            Edit Community Information
                            <img src={arrowRight} alt="arrowRight"/>
                        </li>
                        <li className={styles.setting} onClick={handleInviteMembers}>
                            Invite Members
                            <img src={arrowRight} alt="arrowRight"/>
                            {showSearchMembersModal && (
                                <Modal onClose={handleCloseInviteModal}>
                                    <input
                                        className={styles.searchMembers}
                                    />
                                </Modal>
                            )}
                        </li>
                        <li
                            className={styles.setting}
                            onClick={() => setShowDeleteModal(true)}
                            style={{color: "#f33"}}
                        >
                            Delete Community
                            <img src={arrowRight} alt="arrowRight"/>
                            {showDeleteModal && (
                                <YesNoPopUp
                                    title={"Delete Community"}
                                    text={`Are you sure you want to delete this community? all posts will be lost`}
                                    onYes={handleDeleteCommunity}
                                    onNo={() => null}
                                    hidePopUp={() => setShowDeleteModal(false)}
                                />
                            )}
                        </li>
                    </ul>
                ) : null}
            </div>
            {showCommunityEditor && (
                <CreateCommunity
                    type="EDIT"
                    onClose={handleCloseEditCommunity}
                    name={info.name}
                    description={info.description}
                    tags={info.tags}
                    icon={info.icon}
                    id={info.id}
                />
            )}
        </div>
    );
}
