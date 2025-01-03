import React, { useEffect, useState } from 'react';
import Post from './Post.tsx';
import {getCommentsOnPost, getPostByID} from '../../../api.ts';
import styles from "./post.module.scss";
import Comment from "../Comment/Comment.tsx";
import Editor from "../Editor/Editor.tsx";
import {useNavigate, useParams} from 'react-router-dom';
import LoaderDots from "../../LoaderDots/LoaderDots.tsx"; // To access the postId from the URL

interface CommentBack {
    attachment: string,
    author: string,
    author_id: number,
    content: string,
    displayname: string,
    id: number,
    level: number,
    like_count: number,
    comment_count: number,
    parent_post_id: number,
    parent_type: string,
    pfp: string,
    post_time: Date,
}

export default function PostPage() {
    const [post, setPost] = useState<React.ReactElement | null>(null);
    const [totalComments, setTotalComments] = useState<number>(0);
    const [comments, setComments] = useState<CommentInfo[]>([]);
    const [isFound, setIsFound] = useState<boolean>(true);
    const [isLoadingMoreComments, setLoadingMoreComments] = useState<boolean>(false);
    const { postId } = useParams<{ postId: string }>(); // Get the postId from the URL
    const navigate = useNavigate();

    useEffect(() => {
        if (postId) {
            // setPostIdInt(parseInt(postId, 10));
            getPostByID(parseInt(postId)).then((res) => {
                if (!res.data || res.data.length === 0) {
                    setIsFound(false);
                    return;
                }
                setIsFound(true);
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
                setTotalComments(postInfo.commentCount);
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

            getCommentsOnPost(parseInt(postId), 0).then((res) => {
                setComments(res.data.map((cd: CommentBack) => ({
                    attachment: cd.attachment,
                    author: cd.author,
                    authorId: cd.author_id,
                    content: cd.content,
                    displayName: cd.displayname,
                    id: cd.id,
                    level: cd.level,
                    likeCount: cd.like_count,
                    commentCount: cd.comment_count,
                    liked: cd.like_count,
                    parentPostId: cd.parent_post_id,
                    parentType: cd.parent_type,
                    pfp: cd.pfp,
                    postTime: cd.post_time,
                })));
            })
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

    const prependComment = (comment: CommentInfo) => {
        setTotalComments(prev => prev + 1);
        setComments(prev => [comment, ...prev]);
    }

    const deleteComment = (commentId: number) => {
        setTotalComments(prev => prev - 1);
        setComments((prev) =>
            prev.filter((c) => c.id !== commentId)
        );
    }

    const handleShowMore = async () => {
        setLoadingMoreComments(true);
        console.log("total comments", totalComments);
        const nextPage = (await getCommentsOnPost(postId ? parseInt(postId) : 0, comments.length)).data;
        console.log("nextPage", nextPage);
        setComments(prev =>
            [...prev, ...nextPage.map((cd: CommentBack) => ({
                attachment: cd.attachment,
                author: cd.author,
                authorId: cd.author_id,
                content: cd.content,
                displayName: cd.displayname,
                id: cd.id,
                level: cd.level,
                likeCount: cd.like_count,
                commentCount: cd.comment_count,
                liked: cd.like_count,
                parentPostId: cd.parent_post_id,
                parentType: cd.parent_type,
                pfp: cd.pfp,
                postTime: cd.post_time,
            }))]
        )
        setLoadingMoreComments(false);
    }

    return (
        <div className={styles.postPage}>
            <div className={styles.header}>
                <div className={styles.arrow_container} onClick={() => goBack()}>
                    {/*back button*/}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                    </svg>
                </div>
                <h3 className={styles.title}>Post</h3>
            </div>
            {isFound ? (
                post ? (
                    <div className={styles.content}>
                        {post}
                        <div className={styles.comments}>
                            <div className={styles.write_answer}>
                                <Editor
                                    type="comment"
                                    parent_id={postId ? parseInt(postId) : null}
                                    handleSubmit={() => null}
                                    prependComment={prependComment}
                                />
                            </div>
                            {comments.map((cur) => (
                                <Comment
                                    key={cur.id}
                                    info={cur}
                                    deleteComment={deleteComment}
                                />
                            ))}
                            {(comments.length && comments.length < totalComments) ? (
                                <button className={styles.show_more} onClick={handleShowMore}>
                                    {isLoadingMoreComments ? <LoaderDots /> : "Show More"}
                                </button>
                            ) : ""}
                        </div>
                    </div>
                ) : (
                    <div>Loading...</div>
                )
            ) : (
                <div style={{textAlign: 'center'}}>
                    <h4>This post is not available</h4>
                    <p>Either the link is not valid or the post was deleted</p>
                </div>
            )}
        </div>
    );
}
