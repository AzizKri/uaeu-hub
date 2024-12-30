import React, {useState} from "react";
import {getLatestPosts} from "../api.ts";
import Post from "../components/Post/Post.tsx";
import {UpdatePostsContext} from "./context.ts";

export const UpdatePostProvider = ({children}: {children: React.ReactNode}) => {
    const [posts, setPosts] = useState<React.ReactElement[]>([]);
    const [page, setPage] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [noMorePosts, setNoMorePosts] = useState<boolean>(false);

    const updatePosts = async () => {
        if (loading || noMorePosts) return;

        setLoading(true);
        try {
            const res = await getLatestPosts(page);
            // console.log(res);
            if (res.results.length == 0) {
                setNoMorePosts(true);
                return;
            }
            setPage((prevPage) => prevPage + 1);
            const fetchedPosts: React.ReactElement[] = []
            for (const post of res.results) {
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
                // console.log("ptc", post.top_comment)
                const tc = JSON.parse(post.top_comment);
                // console.log("tc", tc)
                const topCommentInfo: CommentInfo | null = !tc ? null : {
                    attachment: tc.attachment,
                    author: tc.author,
                    authorId: tc.author_id,
                    content: tc.content,
                    displayName: tc.displayname,
                    id: tc.id,
                    level: tc.level,
                    likeCount: tc.like_count,
                    liked: tc.liked,
                    parentPostId: tc.parent_post_id,
                    parentType: tc.parent_type,
                    pfp: tc.pfp,
                    postTime: tc.post_time,
                    commentCount: tc.comment_count,
                }

                const communityInfo: CommunityInfoSimple = {
                    name: post.community,
                    icon: post.community_icon
                }
                fetchedPosts.push(
                    <Post
                        key={post.id}
                        postInfo={postInfo}
                        topCommentInfo={topCommentInfo}
                        communityInfo={communityInfo}
                    />
                );
            }
            setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <UpdatePostsContext.Provider value={{posts, updatePosts, loading}}>
            {children}
        </UpdatePostsContext.Provider>
    )
}

