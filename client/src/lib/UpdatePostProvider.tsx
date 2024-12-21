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
            console.log(page);
            if (res.results.length == 0) {
                setNoMorePosts(true);
                return;
            }
            setPage((prevPage) => prevPage + 1);
            const fetchedPosts: React.ReactElement[] = []
            for (const post of res.results) {
                fetchedPosts.push(
                    <Post
                        key={post.id}
                        id={post.id}
                        content={post.content}
                        authorUsername={post.author}
                        authorDisplayName={post.displayname}
                        pfp={post.pfp}
                        postDate={new Date(post.post_time)}
                        filename={post.attachment}
                        likes={post.like_count}
                        comments_count={post.comment_count}
                        isPostPage={false}
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

