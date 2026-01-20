import styles from "../UserContent.module.scss";
import React, {memo, useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { getPostsByUser } from "../../../api/posts.ts";
import Post from "../../PostStuff/Post/Post.tsx";
import ShowMoreBtn from "../../Reusable/ShowMoreBtn/ShowMoreBtn.tsx";
import Skeleton from "../../Reusable/Skeleton/Skeleton.tsx";

function UserPosts() {
    const [userPosts, setUserPosts] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMorePosts, setIsLoadingMorePosts] =
        useState<boolean>(false);
    const [noMoreComments, setNoMoreComments] = useState<boolean>(false);
    const { username } = useParams<{ username: string }>();

    useEffect(() => {
        if (!username) return;
        setIsLoading(true);
        getPostsByUser(username, userPosts.length).then((res) => {
            console.log("getting user posts");
            if (res.data.length == 0) {
                setIsLoading(false);
                return;
            }
            if (res.data.length < 10) {
                setNoMoreComments(true);
            }
            const fetchedPosts: React.ReactElement[] = [];
            for (const post of res.data) {
                const postInfo: PostInfo = {
                    id: post.id,
                    publicId: post.public_id,
                    content: post.content,
                    authorUsername: post.author,
                    authorDisplayName: post.displayname,
                    pfp: post.pfp,
                    postDate: new Date(post.post_time),
                    filename: post.attachment,
                    likeCount: post.like_count,
                    commentCount: post.comment_count,
                    type: "POST",
                    liked: post.like,
                };
                const communityInfo: CommunityInfoSimple = {
                    name: post.community,
                    icon: post.community_icon,
                };
                fetchedPosts.push(
                    <Post
                        key={post.id}
                        postInfo={postInfo}
                        communityInfo={communityInfo}
                        from={`user/${username}`}
                    />,
                );
            }
            setUserPosts((prevPosts) => [...fetchedPosts, ...prevPosts]);
        })
            .catch((err) => {console.error(err)})
        .finally(() => setIsLoading(false));
    }, [username]);

    const handleShowMore = async () => {
        setIsLoadingMorePosts(true);

        getPostsByUser(username!, userPosts.length)
            .then((res) => {
                console.log("getting more user posts");
                if (res.data.length < 10) {
                    setNoMoreComments(true);
                }
                setUserPosts((prev) => [
                    ...prev,
                    ...res.data.map(
                        (post: {
                            id: number;
                            content: string;
                            author: string;
                            displayname: string;
                            pfp: string;
                            post_time: string | number | Date;
                            attachment: string;
                            like_count: number;
                            comment_count: number;
                            like: boolean;
                            community: string;
                            community_icon: string;
                        }) => (
                            <Post
                                key={post.id}
                                postInfo={{
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
                                    liked: post.like,
                                }}
                                communityInfo={{
                                    name: post.community,
                                    icon: post.community_icon,
                                }}
                                from={`user/${username}`}
                            />
                        ),
                    ),
                ]);
            })
            .finally(() => {
                setIsLoadingMorePosts(false);
            });
    };

    return isLoading ? (
        <Skeleton type={"post"}/>
    ) : (
        <>
            <div className={styles.userContentContainer}>{userPosts}</div>
            {userPosts.length > 0 && !noMoreComments && (
                <ShowMoreBtn onClick={handleShowMore} isLoadingMore={isLoadingMorePosts}/>
            )}
        </>
    );
}
export default memo(UserPosts);
