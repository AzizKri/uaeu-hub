import styles from './Comment.module.scss';
import Content from "../Content/Content.tsx";
import {useEffect, useRef, useState} from "react";
import {getFormattedDate} from "../../../utils/tools.ts";
import OptionsMenu from "../OptionsMenu/OptionsMenu.tsx";
import Modal from "../../Reusable/Modal/Modal.tsx"
import Editor from "../Editor/Editor.tsx";
import {getSubCommentsOnComment} from "../../../api/subComments.ts";
import ThreeDotsLine from "../../Reusable/Animations/ThreeDotsLine/ThreeDotsLine.tsx";
import {Link} from "react-router-dom";
import reply from "../../../assets/reply.svg"
import {likeComment} from "../../../api/comments.ts";
import UnAuthorizedPopUp from "../../Reusable/UnAuthorizedPopUp/UnAuthorizedPopUp.tsx";
import SuspendedPopUp from "../../Reusable/SuspendedPopUp/SuspendedPopUp.tsx";
import LineSpinner from "../../Reusable/Animations/LineSpinner/LineSpinner.tsx";
import SubComment from "../SubComment/SubComment.tsx";
import likeIconUnliked from "../../../assets/unliked.svg";
import likeIconLiked from "../../../assets/liked.svg";
import ProfilePictureComponent from "../../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";

interface SubCommentBack {
    attachment: string,
    author: string,
    author_id: string,
    comment_count: number,
    content: string,
    displayname: string,
    id: number,
    like_count: number,
    liked: boolean,
    parent_comment_id: number,
    pfp: string,
    post_time: Date,
}

interface CommentProps {
    info: CommentInfo;
    deleteComment: (commentId: number) => void;
    shouldFocusComment?: boolean;
    targetReplyId?: number;
}

function mapSubComment(cd: SubCommentBack): CommentInfo {
    return {
        attachment: cd.attachment,
        author: cd.author,
        authorId: cd.author_id,
        content: cd.content,
        displayName: cd.displayname,
        id: cd.id,
        likeCount: cd.like_count,
        commentCount: cd.comment_count,
        liked: cd.liked,
        parentId: cd.parent_comment_id,
        pfp: cd.pfp,
        postTime: new Date(cd.post_time),
    };
}

export default function Comment({info, deleteComment, shouldFocusComment = false, targetReplyId}: CommentProps) {
    const [showReplyPopUp, setShowReplyPopUp] = useState<boolean>(false);
    const [dateText, setDateText] = useState<string>("");
    const [repliesShown, setRepliesShown] = useState<boolean>(false);
    const [repliesLoading, setRepliesLoading] = useState<boolean>(false);
    const [subComments, setSubComments] = useState<CommentInfo[]>([]);
    const [totalSubComments, setTotalSubComments] = useState<number>(info.commentCount);
    const [isLoadingMoreSubComments, setIsLoadingMoreSubComments] = useState<boolean>(false);
    const [likeState, setLikeState] = useState<"LIKE" | "DISLIKE" | "NONE">(info.liked ? "LIKE" : "NONE");
    const [likesCount, setLikesCount] = useState<number>(info.likeCount);
    const [showActionPopUp, setShowActionPopUp] = useState<boolean>(false);
    const [showSuspendedPopUp, setShowSuspendedPopUp] = useState<boolean>(false);
    const {isUser, isSuspended} = useUser();
    const commentRef = useRef<HTMLDivElement>(null);
    const handledDeepLinkRef = useRef<string | null>(null);
    const highlightTimeoutRef = useRef<number | null>(null);
    const [isTargetHighlighted, setIsTargetHighlighted] = useState(false);
    const [highlightedReplyId, setHighlightedReplyId] = useState<number | null>(null);

    useEffect(() => {
        setDateText(getFormattedDate(info.postTime));
        setLikesCount(info.likeCount);
        setTotalSubComments(info.commentCount);
        if (info.liked) {
            setLikeState("LIKE");
        } else {
            setLikeState("NONE");
        }
    }, [info.postTime, info.likeCount, info.commentCount, info.liked]);

    useEffect(() => {
        return () => {
            if (highlightTimeoutRef.current) {
                window.clearTimeout(highlightTimeoutRef.current);
            }
        };
    }, []);

    const highlightComment = () => {
        if (highlightTimeoutRef.current) {
            window.clearTimeout(highlightTimeoutRef.current);
        }

        setHighlightedReplyId(null);
        setIsTargetHighlighted(true);
        commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        highlightTimeoutRef.current = window.setTimeout(() => {
            setIsTargetHighlighted(false);
        }, 2500);
    };

    const handleReply = () => {
        if (isSuspended()) {
            setShowSuspendedPopUp(true);
            return;
        }
        setShowReplyPopUp(true)
    }

    const hideReplyPopUp = () => {
        setShowReplyPopUp(false);
    }

    const loadReplies = async (replyId?: number) => {
        setRepliesShown(true);
        setRepliesLoading(true);

        let loadedReplies: CommentInfo[] = [];
        let offset = 0;

        while (true) {
            const response = await getSubCommentsOnComment(info.id, offset);
            const nextBatch = response.data.map((cd: SubCommentBack) => mapSubComment(cd));
            loadedReplies = [...loadedReplies, ...nextBatch];
            setSubComments(loadedReplies);

            const foundTargetReply = replyId ? loadedReplies.some((reply) => reply.id === replyId) : true;
            const reachedEnd = nextBatch.length === 0 || loadedReplies.length >= totalSubComments;

            if (foundTargetReply || reachedEnd) {
                break;
            }

            offset = loadedReplies.length;
        }

        setRepliesLoading(false);
        return loadedReplies;
    };

    const toggleReplies = () => {
        setRepliesShown((prev) => !prev);
        if (subComments.length === 0) {
            void loadReplies();
        }
    };

    const prependSubComment = (subComment: CommentInfo) => {
        document.body.style.position = "static";
        setTotalSubComments(prev => prev + 1);
        setSubComments(prev => [...prev, subComment]);
        setShowReplyPopUp(false);
        setRepliesShown(true);
    }

    const handleShowMore = async () => {
        setIsLoadingMoreSubComments(true);
        getSubCommentsOnComment(info.id, subComments.length).then((res) => {
            setSubComments(prev => [
                ...prev,
                ...res.data.map((cd: SubCommentBack) => mapSubComment(cd))
            ]);
            setIsLoadingMoreSubComments(false);
        });
    };

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
        likeComment(info.id);
    }

    const hideActionPopUp = () => {
        setShowActionPopUp(false)
    }

    const deleteSubComment = (subCommentId: number) => {
        setTotalSubComments(prev => prev - 1);
        setSubComments((prev) =>
            prev.filter((c) => c.id !== subCommentId)
        );
    };

    useEffect(() => {
        if (!shouldFocusComment) {
            handledDeepLinkRef.current = null;
            return;
        }

        const deepLinkKey = `${info.id}:${targetReplyId ?? "comment"}`;
        if (handledDeepLinkRef.current === deepLinkKey) {
            return;
        }

        handledDeepLinkRef.current = deepLinkKey;

        const resolveDeepLink = async () => {
            if (!targetReplyId) {
                highlightComment();
                return;
            }

            if (totalSubComments === 0) {
                highlightComment();
                return;
            }

            const loadedReplies = await loadReplies(targetReplyId);
            const targetReply = loadedReplies.find((reply) => reply.id === targetReplyId);

            if (targetReply) {
                setHighlightedReplyId(targetReplyId);
                return;
            }

            highlightComment();
        };

        void resolveDeepLink();
    }, [info.id, shouldFocusComment, targetReplyId, totalSubComments]);

    return (
        <div
            ref={commentRef}
            className={`${styles.comment} ${isTargetHighlighted ? styles.targeted : ""}`}
        >
            {showActionPopUp && (
                <UnAuthorizedPopUp hidePopUp={hideActionPopUp} />
            )}
            {showSuspendedPopUp && (
                <SuspendedPopUp hidePopUp={() => setShowSuspendedPopUp(false)} />
            )}
            {showReplyPopUp && (
                <Modal onClose={hideReplyPopUp}>
                    <Editor
                        type="SUB-COMMENT"
                        parentId={info.id}
                        prependComment={prependSubComment}
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
                        <OptionsMenu
                            type={"COMMENT"}
                            id={info.id}
                            author={info.author}
                            deleteComment={deleteComment}
                        />
                    </div>
                </div>
                <div className={styles.comment__content__text}>
                    <Content
                        content={info.content}
                        filename={info.attachment}
                        type={"comment"}
                    />
                </div>
                <div className={styles.comment__content__footer}>
                    <button
                        className={`${styles.vote_icon} ${styles.btn_hover}`}
                        onClick={handleUpVote}
                    >
                        {likeState === "LIKE" ? (
                            <img src={likeIconLiked} alt="liked" />
                        ) : (
                            <img src={likeIconUnliked} alt="like" />
                        )}
                    </button>
                    <span className={styles.comment__content__footer__votes}>
                        {likesCount}
                    </span>
                    {/*<button*/}
                    {/*    className={`${styles.vote_icon} ${styles.btn_hover}`}*/}
                    {/*    onClick={handleDownVote}*/}
                    {/*>*/}
                    {/*    {likeState === "DISLIKE" ? (*/}
                    {/*        <img src={down_vote} alt="down voted" />*/}
                    {/*    ) : (*/}
                    {/*        <img src={down_vote_outline} alt="down vote" />*/}
                    {/*    )}*/}
                    {/*</button>*/}
                    <button
                        className={`${styles.comment__content__footer__reply} ${styles.btn_hover}`}
                        onClick={handleReply}
                    >
                        <img src={reply} alt="reply" />
                        <span>reply</span>
                    </button>
                </div>
                {info.commentCount > 0 && (
                    <div
                        className={styles.view_comment}
                        onClick={toggleReplies}
                    >
                        {repliesShown
                            ? "hide replies"
                            : `show replies (${totalSubComments})`}
                    </div>
                )}
                {repliesShown &&
                    (repliesLoading ? (
                        <LineSpinner />
                    ) : (
                        <>
                            {subComments.map((cur) => (
                                <SubComment
                                    key={cur.id}
                                    info={cur}
                                    deleteComment={deleteSubComment}
                                    parentPrependSubComment={prependSubComment}
                                    highlighted={highlightedReplyId === cur.id}
                                />
                            ))}
                            {subComments.length < totalSubComments && (
                                <button
                                    className={styles.show_more}
                                    onClick={handleShowMore}
                                >
                                    {isLoadingMoreSubComments ? (
                                        <ThreeDotsLine />
                                    ) : (
                                        "Show More"
                                    )}
                                </button>
                            )}
                        </>
                    ))}
            </div>
        </div>
    );
}
