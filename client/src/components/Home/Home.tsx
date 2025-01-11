import styles from './Home.module.scss';
import React, { useEffect, useRef } from 'react';
import WritePost from '../PostStuff/WritePost/WritePost.tsx';
import { useUpdatePosts, useUser } from '../../lib/utils/hooks.ts';

export default function Home() {
    const { posts, updatePosts, loading } = useUpdatePosts();
    const homeRef = useRef<HTMLDivElement>(null);
    const { userReady } = useUser();

    useEffect(() => {
        if (!userReady) return;
        updatePosts();
    }, [userReady]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (!loading && event.currentTarget.scrollHeight - event.currentTarget.scrollTop < 2 * window.innerHeight) {
            updatePosts();
        }
    };

    return (
        <div className={styles.home} onScroll={handleScroll} ref={homeRef} style={{}}>
            <WritePost />
            {/*Do we need this?*/}
            {/*<div className={styles.questionsRecent}>*/}
            {/*    <h3>Recent Questions</h3>*/}
            {/*    <span>20 new questions</span>*/}
            {/*</div>*/}
            <section className={styles.posts_container}>
                {(posts.length > 0) ? posts : (loading ? <div className={styles.posts_container_text}>Loading...</div> :
                    <div className={styles.posts_container_text}>No posts yet... Be the first to write one!</div>)}
            </section>
        </div>
    );
}
