import React, {useEffect, useState} from 'react';
import styles from './UserProfile.module.scss';
import {useNavigate, useParams} from "react-router-dom";
import {getPostsByUser, getUserByUsername} from "../../api.ts";
import Post from "../PostStuff/Post/Post.tsx";



const tabs = [
    { label: 'Posts' },
    { label: 'Comments' },
    { label: 'Liked' },
];

export default function UserProfile () {
    // State for the current tab
    const [activeTab, setActiveTab] = useState('Posts');
    const [user, setUser] = useState<userInfo>();
    const { username } =  useParams<{ username: string }>();
    const navigate = useNavigate();
    const [userPosts, setUserPosts] = useState<React.ReactElement[]>([])
    const [page, setPage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);


    useEffect(() => {
        if (username) {
           getUserByUsername(username).then(async (res) => {
               console.log(res);
               const data = res.data;
               console.log(data);
               if (res.status !== 200){
                   navigate('/error');
               } else{
                   setUser({
                       username: data.username,
                       displayName: data.displayname,
                       bio: data.bio,
                       pfp: data.pfp,
                       isAnonymous: false,
                   });
               }
            });
        }
    }, [username, navigate]);

    const handleTabClick = (tabLabel: string) => {
        setActiveTab(tabLabel);
        if (tabLabel === 'Posts') handleGetPosts();
    };

    const handleGetPosts = async () => {
        if (!user) return;
        try {
            const res = await getPostsByUser(user.username, page);
            console.log("user psots results", res);
            if (res.data.length == 0) {
                return;
            }
            setPage((prevPage) => prevPage + 1);
            const fetchedPosts: React.ReactElement[] = []
            for (const post of res.data) {
                // console.log(post);
                const postInfo: PostInfo = {
                    id: post.id,
                    content: post.content,
                    authorUsername: post.author,
                    authorDisplayName: post.displayname,
                    pfp: post.pfp,
                    postDate: new Date(post.post_time),
                    filename: post.attachment,
                    likeCount: post.like_count,
                    commentCount: post.comment_count,
                    type: "post",
                    liked: post.like,
                };
                const communityInfo: CommunityInfoSimple = {
                    name: post.community,
                    icon: post.community_icon
                }
                fetchedPosts.push(
                    <Post
                        key={post.id}
                        postInfo={postInfo}
                        topCommentInfo={null}
                        communityInfo={communityInfo}
                    />
                );
            }
            setUserPosts((prevPosts) => [...fetchedPosts, ...prevPosts]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    // Example content for "hasn't posted yet"
    const getTabContent = (currentTab: string) => {
        switch (currentTab) {
            case 'Posts':
                return (
                    <>
                    {userPosts.length === 0 ? (
                        <div className={styles.noPosts}>
                            <p>{`@${user ? user.username : ''} hasn't posted yet`}</p>
                        </div>
                    ) : (
                        <div>
                            {userPosts}
                        </div>
                    )}
                    </>
                );
            case 'Comments':
                return (
                    <div className={styles.noPosts}>
                        <p>{`@${user ? user.username : ''} hasn't commented yet`}</p>
                    </div>
                );
            default:
                return (
                    <div className={styles.noPosts}>
                        <p>{`No ${currentTab.toLowerCase()} available yet`}</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.userHeader}>
                <div className={styles.userAvatar}>
                    <div className={styles.avatarIcon} style={{backgroundImage : `url(${user ? (user.pfp ? user.pfp : '') : ''})`}} />
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.displayName}>{user ? user.displayName : ''}</h1>
                    <h2 className={styles.username}>@{user ? user.username : ''}</h2>
                    <p className={styles.userBio}>
                        {user ? (user.bio ? user.bio : '') : ''}
                    </p>
                </div>
                <button className={styles.editProfileButton}>Edit Profile</button>
            </div>

            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.label}
                        className={`${styles.tabButton} ${
                            activeTab === tab.label ? styles.active : ''
                        }`}
                        onClick={() => handleTabClick(tab.label)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>{getTabContent(activeTab)}</div>
            {isLoading && <span>Loading...</span>}
        </div>
    );
};
