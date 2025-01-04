import "./post.module.scss";
import profilePicture from "../../../assets/profile-picture.png";
import communityIcon from "../../../assets/community-icon.jpg"
import PostFooter from "../PostFooter/PostFooter.tsx";
import Comment from "../Comment/Comment.tsx";
import styles from "./post.module.scss";
import { useEffect, useState } from "react";
import { getFormattedDate } from "../../../lib/tools.ts";
import Content from "../Content/Content.tsx";
import OptionsMenu from "../OptionsMenu/OptionsMenu.tsx";
import {Link} from "react-router-dom";

export default function Post({ postInfo, topCommentInfo, communityInfo, from}: PostAll & {from?: string}) {
    const [dateText, setDateText] = useState<string>("");
    const [topComment, setTopComment] = useState<CommentInfo | null>(topCommentInfo);


    useEffect(() => {
        setDateText(getFormattedDate(postInfo.postDate));
    }, [postInfo.postDate]);

    const deleteTopComment = () => {
        setTopComment(null);
    }

    return (
        <div className={styles.post}>
            <div className={styles.post__info_bar}>
                <div className={styles.pics}>
                    <Link to={`/community/${communityInfo.name}`}>
                        <img
                            src={
                                communityInfo.icon == undefined
                                    ? communityIcon
                                    : communityInfo.icon
                            }
                            alt="community icon"
                            className={styles.community_icon}
                        />
                    </Link>
                    <Link to={`/user/${postInfo.authorUsername}`}>
                        <img
                            src={
                                postInfo.pfp == undefined
                                    ? profilePicture
                                    : postInfo.pfp
                            }
                            alt="profile picture"
                            className={styles.user_icon}
                        />
                    </Link>
                </div>
                <div className={styles.names}>
                    <Link to={`/community/${communityInfo.name}`}>
                        <div className={styles.community_name}>
                            {communityInfo.name}
                        </div>
                    </Link>
                        <div className={styles.username}>
                            <Link to={`user/${postInfo.authorUsername}`} className={styles.displayName}>
                            {postInfo.authorDisplayName}
                            </Link>
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
                id={postInfo.id}
                content={postInfo.content}
                filename={postInfo.filename}
                type={postInfo.type}
                from={from}
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
