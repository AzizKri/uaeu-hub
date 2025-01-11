import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getPostsByUser} from "../../../api/posts.ts";
import Post from "../../PostStuff/Post/Post.tsx";
import styles from "../UserContent.module.scss"

export default function UserPosts () {
    const [userPosts, setUserPosts] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const { username } =  useParams<{ username: string }>();

    useEffect(() => {
        if (!username) return;
        setIsLoading(true);
        try {
            getPostsByUser(username, page).then((res) => {
                // console.log("profileUser posts results", res);
                if (res.data.length == 0) {
                    setIsLoading(false);
                    return;
                }
                setPage((prevPage) => prevPage + 1);
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
                setUserPosts((prevPosts) => [...fetchedPosts, ...prevPosts]);
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [page, username]);

    return (
        <>
            <div className={styles.userContentContainer}>
                {userPosts}
            </div>
            {isLoading && <span>Loading...</span>}
        </>
    )
}
