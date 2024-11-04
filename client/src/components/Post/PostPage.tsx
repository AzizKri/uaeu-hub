import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // To access the postId from the URL
import Post from './Post';
import { getPostByID } from '../../api.ts';
import styles from "./post.module.scss"; // Assuming you already have a Post component

export default function PostPage() {
    const { postId } = useParams<{ postId: string }>(); // Get the postId from the URL
    const [post, setPost] = useState<React.ReactElement | null>(null);

    useEffect(() => {
        if (postId) {
            getPostByID(parseInt(postId, 10)).then((res) => {
                const fetchedPost = (
                    <Post
                        key={res.results[0].id}
                        id={res.results[0].id}
                        content={res.results[0].content}
                        authorUsername={res.results[0].author}
                        authorDisplayName={res.results[0].displayname}
                        pfp={res.results[0].pfp}
                        postDate={new Date(res.results[0].post_time)}
                        filename={res.results[0].attachment}
                        likes={res.results[0].like_count}
                        comments={res.results[0].comment_count}
                    />
                );
                console.log(res);
                setPost(fetchedPost);
            });
        }
    }, [postId]); // Fetch the post when postId changes

    const goBack = () => {
        if (document.referrer && document.referrer.includes(location.origin)) {
            history.back();
        } else {
            location.assign(location.origin);
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <div className={styles.arrow_container} onClick={() => goBack()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                    </svg>
                </div>
                <h3 className={styles.title}>Post</h3>
            </div>
            {post ? post : <p>Loading...</p>} {/* Render post or show loading */}
        </div>
    );
}
