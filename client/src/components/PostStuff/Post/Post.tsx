import "./post.module.scss";
import PostFooter from "../PostFooter/PostFooter.tsx";
import styles from "./post.module.scss";
import React from "react";
import { getFormattedDate } from "../../../lib/utils/tools.ts";
import Content from "../Content/Content.tsx";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header.tsx";

export default function Post({
    postInfo,
    // topCommentInfo,
    communityInfo,
    from,
}: PostAll & { from?: string }) {
    // const [topComment, setTopComment] = useState<CommentInfo | undefined>(
    //     topCommentInfo,
    // );
    const navigate = useNavigate();

    // const deleteTopComment = () => {
    //     setTopComment(undefined);
    // };

    const handleClickOnPost: React.MouseEventHandler<HTMLDivElement> = () => {
        if (postInfo.type === "POST-PAGE") return;
        navigate(`/post/${postInfo.id}`, { state: { from: from } });
    };

    return (
        <div
            className={styles.post}
            style={{
                cursor: postInfo.type === "POST-PAGE" ? "default" : "pointer",
            }}
            onClick={handleClickOnPost}
        >
            <Header
                type={postInfo.type === "NO_COMMUNITY" ? "DISPLAYNAME+USERNAME" : "COMMUNITY+DISPLAYNAME"}
                username={postInfo.authorUsername}
                displayName={postInfo.authorDisplayName}
                timeText={getFormattedDate(postInfo.postDate)}
                postId={postInfo.id}
                userIcon={postInfo.pfp}
                communityIcon={communityInfo?.icon}
                community={communityInfo?.name}
            />
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
                type={postInfo.type}
            />

            {/*{postInfo.type === "POST" && topComment != null ? (*/}
            {/*    <Comment info={topComment} deleteComment={deleteTopComment} />*/}
            {/*) : null}*/}
        </div>
    );
}
