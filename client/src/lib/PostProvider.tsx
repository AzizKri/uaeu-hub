import React, {useRef, useState} from "react";
import {getLatestPosts} from "../api.ts";
import {PostsContext} from "./context.ts";

export const PostsProvider = ({children}: { children: React.ReactNode }) => {
    const [posts, setPosts] = useState<PostInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [noMorePosts, setNoMorePosts] = useState<boolean>(false);

    const pageRef = useRef<number>(0);

    const updatePosts = async () => {
        if (loading || noMorePosts) return;

        setLoading(true);
        try {
            const res = await getLatestPosts(pageRef.current);
            console.log(pageRef.current);
            if (res.results.length == 0) {
                setNoMorePosts(true);
                return;
            }
            pageRef.current = pageRef.current + 1;
            const fetchedPosts: PostInfo[] = []
            for (const post of res.results) {
                fetchedPosts.push({
                    id: post.id,
                    content: post.content,
                    author: {
                        username: post.author,
                        displayname: post.displayname,
                        pfp: post.pfp
                    },
                    date: new Date(post.post_time),
                    filename: post.attachment,
                    likes: post.like_count,
                    comments_count: post.comment_count,
                    type: "post"
                });
            }
            setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <PostsContext.Provider value={{posts, updatePosts, loading}}>
            {children}
        </PostsContext.Provider>
    )
}

