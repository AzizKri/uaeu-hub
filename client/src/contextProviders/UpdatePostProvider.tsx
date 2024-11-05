import React, {createContext, useState} from "react";
import {getLatestPosts} from "../api.ts";
import Post from "../components/Post/Post.tsx";

export const UpdatePostsContext = createContext<UpdatePostsContestInterface | null>(null);

export const UpdatePostProvider = ({children}: {children: React.ReactNode}) => {
    const [posts, setPosts] = useState<React.ReactElement[]>([]);
    const updatePosts = () => {
        getLatestPosts().then((res) => {
            const fetchedPosts = []
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
                        comments={post.comment_count}
                        isPostPage={false}
                    />
                );
            }
            setPosts(fetchedPosts);
        })
    }

    return (
        <UpdatePostsContext.Provider value={{posts, updatePosts}}>
            {children}
        </UpdatePostsContext.Provider>
    )
}

