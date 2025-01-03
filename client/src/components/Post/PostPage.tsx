import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom'; // To access the postId from the URL
import Post from './Post';
import { getPostByID } from '../../api.ts';
import styles from "./post.module.scss";

export default function PostPage() {
    const { postId } = useParams<{ postId: string }>(); // Get the postId from the URL
    const [post, setPost] = useState<React.ReactElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (postId) {
            getPostByID(parseInt(postId, 10)).then((res) => {
                const post = res.data[0];
                const postInfo: PostInfo = {
                    id: post.id,
                    content: post.content,
                    authorUsername: post.author,
                    authorDisplayName: post.displayname,
                    pfp: post.pfp,
                    postDate: new Date(post.post_time),
                    filename: post.attachment,
                    likeCount: post.like_count,
                    commentCount: post.comment_count,
                    type: "post-page",
                    liked: post.like,
                };
                const communityInfo: CommunityInfoSimple = {
                    name: post.community,
                    icon: post.community_icon
                }
                const fetchedPost = (
                    <Post
                        key={post.id}
                        postInfo={postInfo}
                        topCommentInfo={null}
                        communityInfo={communityInfo}
                    />
                );
                setPost(fetchedPost);
            });
        }
    }, [postId]); // Fetch the post when postId changes

    const goBack = () => {
        if (document.referrer && document.referrer.includes(location.origin)) {
            // we are coming from inside the website
            navigate(-1);
        } else {
            // either there is no history or we are coming from an external website
            navigate('/');
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <div className={styles.arrow_container} onClick={() => goBack()}>
                    {/*back button*/}
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
