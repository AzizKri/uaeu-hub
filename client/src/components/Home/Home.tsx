import styles from "./Home.module.scss";
import Post from "../Post/Post.tsx";
import {getLatestPosts} from "../../api.ts";
import React, {useEffect, useState} from "react";
import WritePost from "../WritePost/WritePost.tsx";

export default function Home() {
    const [posts, setPosts] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        getLatestPosts().then((res) => {
            const fetchedPosts = []
            for (const post of res.results) {
                fetchedPosts.push(
                    <Post
                        key={post.id}
                        content={post.content}
                        authorUsername={post.author}
                        authorDisplayName={post.displayname}
                        pfp={post.pfp}
                        postDate={new Date(post.post_time)}
                    />
                );
            }
            setPosts(fetchedPosts);
        })
    }, [])

    return (
        <>
            <WritePost />
            <div className={styles.questionsRecent}>
                <h3>Recent Questions</h3>
                <span>20 new questions</span>
            </div>
            {posts}
        </>
    )
}