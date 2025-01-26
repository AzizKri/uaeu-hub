import styles from './Home.module.scss';
import { useEffect, useRef } from 'react';
import WritePost from '../PostStuff/WritePost/WritePost.tsx';
import {debounce} from "../../utils/tools.ts";
import LineSpinner from "../Reusable/Animations/LineSpinner/LineSpinner.tsx";
import {useUpdatePosts} from "../../contexts/updatePosts/UpdatePostsContext.ts";
import {useUser} from "../../contexts/user/UserContext.ts";

export default function Home() {
    const { posts, updatePosts, loading } = useUpdatePosts();
    const homeRef = useRef<HTMLDivElement>(null);
    const { userReady } = useUser();

    useEffect(() => {
        if (!userReady) return;
        updatePosts();
    }, [userReady]);

    useEffect(() => {
        const handleScroll = debounce(() => {
            const {scrollHeight, scrollTop} = document.documentElement;
            const nearBottom = scrollHeight - scrollTop <= 2 * window.innerHeight;

            if (!loading && nearBottom) {
                updatePosts();
            }
        }, 200);

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };

    }, [updatePosts, loading]);


    return (
        <div className={styles.home} ref={homeRef} style={{}}>
            <WritePost />
            <section className={styles.posts_container}>
                {(posts.length > 0) ? posts : (loading ? <div className={styles.posts_container_text}>Loading...</div> :
                    <div className={styles.posts_container_text}>No posts yet... Be the first to write one!</div>)}
            </section>
            {loading && <LineSpinner width="40px"/>}
        </div>
    );
}
