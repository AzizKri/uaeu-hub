import "./post.module.scss";
import profilePicture from "../../../assets/profile-picture.png";
import communityIcon from "../../../assets/community-icon.jpg"
import PostFooter from "../PostFooter/PostFooter.tsx";
import Comment from "../Comment/Comment.tsx";
import styles from "./post.module.scss";
import React, { useEffect, useState } from "react";
import { getFormattedDate } from "../../../lib/tools.ts";
import Content from "../Content/Content.tsx";
import OptionsMenu from "../OptionsMenu/OptionsMenu.tsx";
import {useNavigate} from "react-router-dom";

export default function Post({ postInfo, topCommentInfo, communityInfo, from}: PostAll & {from?: string}) {
    const [dateText, setDateText] = useState<string>("");
    const [topComment, setTopComment] = useState<CommentInfo | null>(topCommentInfo);
    const navigate = useNavigate();


    useEffect(() => {
        setDateText(getFormattedDate(postInfo.postDate));
    }, [postInfo.postDate]);

    const deleteTopComment = () => {
        setTopComment(null);
    }

    const handleClickOnPost: React.MouseEventHandler<HTMLDivElement> = () => {
        if (postInfo.type === 'post') {
            navigate(`/post/${postInfo.id}`, {state: {from: from} });
        }
    }

    const goToCommunity: React.MouseEventHandler = (e) => {
        e.stopPropagation()
        navigate(`/community/${communityInfo.name}`);
    }

    const goToAuthor: React.MouseEventHandler = (e) => {
        e.stopPropagation()
        navigate(`/user/${postInfo.authorUsername}`);
    }

    return (
        <div className={styles.post}
             style={{cursor: postInfo.type === 'post' ? 'pointer' : 'default'}}
             onClick={handleClickOnPost}>
            <div className={styles.post__info_bar}>
                <div className={styles.pics}>
                    <img
                        src={
                            communityInfo.icon == undefined
                                ? communityIcon
                                : communityInfo.icon
                        }
                        alt="community icon"
                        className={styles.community_icon}
                        onClick={goToCommunity}
                    />
                    <img
                        src={
                            postInfo.pfp == undefined
                                ? profilePicture
                                : postInfo.pfp
                        }
                        alt="profile picture"
                        className={styles.user_icon}
                        onClick={goToAuthor}
                    />
                </div>
                <div className={styles.names}>
                    <div
                        className={styles.community_name}
                        onClick={goToCommunity}
                    >
                        {communityInfo.name}
                    </div>
                    <div className={styles.username}>
                        <span onClick={goToAuthor}>{postInfo.authorDisplayName}</span>
                        <span className={styles.dot}>•</span>
                        {dateText}
                    </div>
                </div>
                <div className={styles.post__info_bar__dots}>
                    <OptionsMenu
                        type="POST"
                        id={postInfo.id}
                        author={postInfo.authorUsername}
                    />
                </div>
            </div>
            <Content
                content={postInfo.content}
                filename={postInfo.filename}
                type={postInfo.type}
            />
            <PostFooter
                id={postInfo.id}
                likes={postInfo.likeCount}
                comments={postInfo.commentCount}
                isLiked={postInfo.liked}
            />

            {postInfo.type === "post" && topComment != null ? (
                <Comment info={topComment} deleteComment={deleteTopComment} />
            ) : null}
        </div>
    );
}
