import React, {createContext, useState} from 'react';
import {getLatestPosts} from "../../api/posts.ts";
import Post from "../../components/PostStuff/Post/Post.tsx";

export const UpdatePostsContext = createContext<UpdatePostsContextInterface | null>(null);

export const UpdatePostsProvider = ({children}: {children: React.ReactNode}) => {
    const [posts, setPosts] = useState<React.ReactElement[]>([]);
    // const [page, setPage] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [noMorePosts, setNoMorePosts] = useState<boolean>(false);

    const updatePosts = async () => {
        if (loading || noMorePosts || window.location.pathname !== "/") return;

        setLoading(true);
        try {
            const res = await getLatestPosts(posts.length);
            if (res.data.length == 0) {
                setNoMorePosts(true);
                return;
            }
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
                        from=""
                    />
                );
            }
            setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
        } catch (error) {
            console.error("an error occur while getting posts", error);
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
