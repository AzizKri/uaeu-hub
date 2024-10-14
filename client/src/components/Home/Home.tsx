import styles from "./Home.module.scss";
import Post from "../Post/Post.tsx";
import {getLatestPosts} from "../../api.ts";
import React, {useEffect, useState, createContext, useContext} from "react";
import WritePost from "../WritePost/WritePost.tsx";

const UpdatePostsContext = createContext<UpdatePostsContestInterface | null>(null);
export default function Home() {
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
                    />
                );
            }
            setPosts(fetchedPosts);
        })
    }

    useEffect(updatePosts, []);

    return (
        <UpdatePostsContext.Provider value={{updatePosts}}>
            <WritePost />
            <div className={styles.questionsRecent}>
                <h3>Recent Questions</h3>
                <span>20 new questions</span>
            </div>
            {posts}
        </UpdatePostsContext.Provider>
    )
}

// TODO: fix this later
export const useUpdatePosts = () => useContext(UpdatePostsContext);