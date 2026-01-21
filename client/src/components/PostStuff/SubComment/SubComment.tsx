import styles from '../Comment/Comment.module.scss';
import Content from "../Content/Content.tsx";
import {useEffect, useState} from "react";
import {getFormattedDate} from "../../../utils/tools.ts";
import OptionsMenu from "../OptionsMenu/OptionsMenu.tsx";
import Modal from "../../Reusable/Modal/Modal.tsx";
import Editor from "../Editor/Editor.tsx";
import {likeSubComment} from "../../../api/subComments.ts";
import {Link} from "react-router-dom";
import reply from "../../../assets/reply.svg"
import UnAuthorizedPopUp from "../../Reusable/UnAuthorizedPopUp/UnAuthorizedPopUp.tsx";
import SuspendedPopUp from "../../Reusable/SuspendedPopUp/SuspendedPopUp.tsx";
import ProfilePictureComponent from "../../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";
import likeIconLiked from "../../../assets/liked.svg";
import likeIconUnliked from "../../../assets/unliked.svg";
import {useUser} from "../../../contexts/user/UserContext.ts";

export default function SubComment({info, deleteComment, parentPrependSubComment}: {info: CommentInfo, deleteComment: (commentId: number) => void, parentPrependSubComment?: (commentInfo: CommentInfo) => void}) {
    const [showReplyPopUp, setShowReplyPopUp] = useState<boolean>(false);
    const [dateText, setDateText] = useState<string>("");
    const [likeState, setLikeState] = useState<"LIKE" | "DISLIKE" | "NONE">("NONE");
    const [likesCount, setLikesCount] = useState<number>(0);
    const [showActionPopUp, setShowActionPopUp] = useState<boolean>(false);
    const [showSuspendedPopUp, setShowSuspendedPopUp] = useState<boolean>(false);
    const {isUser, isSuspended} = useUser();
    const [initialText, setInitialText] = useState<string>("");

    useEffect(() => {
        setDateText(getFormattedDate(info.postTime))
        setLikesCount(info.likeCount);
        if (info.liked) {
            setLikeState("LIKE");
        }
    }, []);

    const handleReply = () => {
        if (isSuspended()) {
            setShowSuspendedPopUp(true);
            return;
        }
        setInitialText(`@${info.author}`);
        setShowReplyPopUp(true)
    }

    const hideReplyPopUp = () => {
        setShowReplyPopUp(false);
    }


    const handleUpVote = () => {
        if (!isUser()) {
            setShowActionPopUp(true);
            return;
        }
        if (isSuspended()) {
            setShowSuspendedPopUp(true);
            return;
        }
        if (likeState === "LIKE") {
            setLikeState("NONE");
            setLikesCount(prev => prev - 1);
        } else if (likeState === "DISLIKE") {
            setLikeState("LIKE");
            setLikesCount(prev => prev + 2);
        } else {
            setLikeState("LIKE");
            setLikesCount(prev => prev + 1);
        }
        likeSubComment(info.id);
    }

    const hideActionPopUp = () => {
        setShowActionPopUp(false)
    }

    const prependSubComment = (subComment: CommentInfo) => {
        if (parentPrependSubComment) parentPrependSubComment(subComment);
        setShowReplyPopUp(false);
    }

    return (
        <div className={styles.comment}>
            {showActionPopUp && (
                <UnAuthorizedPopUp hidePopUp={hideActionPopUp}/>
            )}
            {showSuspendedPopUp && (
                <SuspendedPopUp hidePopUp={() => setShowSuspendedPopUp(false)} />
            )}
            {showReplyPopUp && (
                <Modal onClose={hideReplyPopUp}>
                    <Editor
                        type={"SUB-COMMENT"}
                        parentId={info.parentId}
                        prependComment={prependSubComment}
                        initialText={initialText}
                        autoFocus={true}
                    />
                </Modal>
            )}
            <div className={styles.comment__profile_pict}>
                <ProfilePictureComponent source={info.pfp} />
            </div>
            <div className={styles.comment__content}>
                <div className={styles.comment__content__header}>
                    <div className={styles.comment__content__header__top_left}>
                        <div className={styles.comment__content__header__top} >
                            <Link to={`/user/${info.author}`}>
                                <div
                                    className={
                                        styles.comment__content__header__display_name
                                    }
                                >
                                    {info.displayName}
                                </div>
                            </Link>
                            <span>•</span>
                            <div className={styles.comment__content__header__time}>
                                {dateText}
                            </div>
                        </div>
                        <div className={styles.comment__content__header__username}>
                            @{info.author}
                        </div>
                    </div>
                    <div className={styles.comment__content__header__menu}>
                        <OptionsMenu type={"SUB-COMMENT"} id={info.id} author={info.author} deleteComment={deleteComment}/>
                    </div>
                </div>
                <div className={styles.comment__content__text}>
                    <Content content={info.content} filename={info.attachment} type={"comment"}/>
                </div>
                <div className={styles.comment__content__footer}>
                    <button
                        className={`${styles.vote_icon} ${styles.btn_hover}`}
                        onClick={handleUpVote}
                    >
                        {likeState === "LIKE" ? (
                            <img src={likeIconLiked} alt="liked"/>
                        ) : (
                            <img src={likeIconUnliked} alt="like"/>
                        )}
                    </button>
                    {/*<button className={`${styles.vote_icon} ${styles.btn_hover}`} onClick={handleUpVote}>*/}
                    {/*    {likeState === "LIKE" ? (*/}
                    {/*        <img src={upvote} alt="upvoted"/>*/}
                    {/*    ) : (*/}
                    {/*        <img src={upvote_outline} alt="upvote"/>*/}
                    {/*    )}*/}
                    {/*</button>*/}
                    <span className={styles.comment__content__footer__votes}>{likesCount}</span>
                    {/*<button className={`${styles.vote_icon} ${styles.btn_hover}`} onClick={handleDownVote}>*/}
                    {/*    {likeState === "DISLIKE" ? (*/}
                    {/*        <img src={down_vote} alt="down voted"/>*/}
                    {/*    ) : (*/}
                    {/*        <img src={down_vote_outline} alt="down vote"/>*/}
                    {/*    )}*/}
                    {/*</button>*/}
                    <button className={`${styles.comment__content__footer__reply} ${styles.btn_hover}`}
                            onClick={handleReply}>
                        <img src={reply} alt="reply"/>
                        <span>reply</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
