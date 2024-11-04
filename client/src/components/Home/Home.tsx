import styles from "./Home.module.scss";
import {useEffect} from "react";
import WritePost from "../WritePost/WritePost.tsx";
import {useUpdatePosts} from "../../contextProviders/usePostProvider.ts";

export default function Home() {

    const context = useUpdatePosts();
    if (!context) {
        throw new Error("useUpdatePosts must be used within a provider");
    }
    const {posts, updatePosts} = context;
    useEffect(updatePosts, []);

    return (
        <>
            <WritePost/>
            <div className={styles.questionsRecent}>
                <h3>Recent Questions</h3>
                <span>20 new questions</span>
            </div>
            <section className={styles.posts_container}>
                {posts}
            </section>
        </>
    )
}
