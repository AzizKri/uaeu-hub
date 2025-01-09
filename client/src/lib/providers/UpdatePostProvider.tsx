import React, { useState } from 'react';
import {getLatestPosts} from "../../api/posts.ts";
import Post from "../../components/PostStuff/Post/Post.tsx";
import {UpdatePostsContext} from "../utils/context.ts";

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
            if (res.data.length == 0) {
                setNoMorePosts(true);
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
                    liked: post.liked,
                };

                const tc = JSON.parse(post.top_comment);
                const topCommentInfo: CommentInfo | null = !tc ? null : {
                    attachment: tc.attachment,
                    author: tc.author,
                    authorId: tc.author_id,
                    content: tc.content,
                    displayName: tc.displayname,
                    id: tc.id,
                    likeCount: tc.like_count,
                    liked: tc.liked,
                    parentId: tc.parent_post_id,
                    pfp: tc.pfp,
                    postTime: new Date(tc.post_time),
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
                        from=""
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

    const prependPost = (post: React.ReactElement) => {
        setPosts((prev) => [post,...prev]);
    }

    const deletePost = (postId: number) => {
        setPosts((prev) => (
            prev.filter((curr) => curr.key && parseInt(curr.key) !== postId)
        ));
    }

    return (
        <UpdatePostsContext.Provider value={{posts, updatePosts, deletePost, prependPost, loading}}>
            {children}
        </UpdatePostsContext.Provider>
    )
}

