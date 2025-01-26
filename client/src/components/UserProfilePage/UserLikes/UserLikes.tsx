import React, {useEffect, useState} from "react";
import {getLikesCurrentUser} from "../../../api/currentUser.ts";
import Post from "../../PostStuff/Post/Post.tsx";
import styles from "../UserContent.module.scss"
import { useParams } from "react-router-dom";
import UserPostsSkeleton from "../UserSkeletons/UserPostsSkeleton.tsx";

export default function UserLikes () {
    const [likedPosts, setLikedPosts] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { username } =  useParams<{ username: string }>();

    useEffect(() => {
        if (!username) return;
        setIsLoading(true);
        getLikesCurrentUser().then((res) => {
            if (res.data.length == 0) {
                setIsLoading(false);
                return;
            }
            const data = res.data;
            const fetchedPosts: React.ReactElement[] = []
            for (const post of data) {
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
                    type: "POST",
                    liked: post.liked,
                };
                const communityInfo: CommunityInfoSimple = {
                    name: post.community,
                    icon: post.community_icon
                }
                fetchedPosts.push(
                    <Post
                        key={post.id}
                        postInfo={postInfo}
                        communityInfo={communityInfo}
                        from={`user/${username}`}
                    />
                );
                setLikedPosts((prevPosts) => [...fetchedPosts, ...prevPosts]);
            }
        })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, [username]);

    return isLoading ? (
        <UserPostsSkeleton />
    ) : (
        <>
            <div className={styles.userContentContainer}>
                {likedPosts}
            </div>
        </>
    )
}
