import styles from "./Home.module.scss";
import React, {useEffect, useRef} from "react";
import WritePost from "../WritePost/WritePost.tsx";
import {useUpdatePosts} from "../../lib/hooks.ts";
import {getCurrentUser} from "../../api.ts";
export default function Home() {

    const context = useUpdatePosts();
    const {posts, updatePosts, loading} = context;
    const homeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        updatePosts()
    }, []);
    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (!loading && event.currentTarget.scrollHeight - event.currentTarget.scrollTop < 2 * window.innerHeight) {
            updatePosts();
        }
    }

    const fetchData = () => {
        getCurrentUser().then((res) => {
            console.log(res.username);
        });
    };

    fetchData();

    return (
        <div className={styles.home} onScroll={handleScroll} ref={homeRef} style={{}}>
            <WritePost/>
            <div className={styles.questionsRecent}>
                <h3>Recent Questions</h3>
                <span>20 new questions</span>
            </div>
            <section className={styles.posts_container}>
                {posts}
            </section>
            {/*TODO: add a loader in case posts are still loading*/}
            {loading && <div>Loading...</div>}
        </div>
    )
}
