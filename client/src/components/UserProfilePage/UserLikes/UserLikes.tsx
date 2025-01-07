import React, {useEffect, useState} from "react";
import {getLikesCurrentUser, getPostByID} from "../../../api.ts";
import Post from "../../PostStuff/Post/Post.tsx";
import styles from "../UserContent.module.scss"
import {useLocation, useNavigate, useParams} from "react-router-dom";

export default function UserLikes () {
    const [likedPosts, setLikedPosts] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { username } =  useParams<{ username: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!username) return;
        if (!location || !location.state?.data?.auth){
            navigate("unauthorized");
        }
        setIsLoading(true);
        try {
            getLikesCurrentUser().then((res) => {
                // console.log("profileUser posts results", res);
                if (res.data.length == 0) {
                    setIsLoading(false);
                    return;
                }
                const data = res.data;
                for (const idx of data) {
                    getPostByID(idx.post_id).then((res) => {
                        const fetchedPosts: React.ReactElement[] = []
                        for (const post of res.data) {
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
                                    from={`user/${username}`}
                                />
                            );
                        }
                        setLikedPosts((prevPosts) => [...fetchedPosts, ...prevPosts]);
                    });
                }
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    return (
        <>
            <div className={styles.userContentContainer}>
                {likedPosts}
            </div>
            {isLoading && <span>Loading...</span>}
        </>
    )
}
