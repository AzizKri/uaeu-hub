import profilePict from '../../../assets/profile-picture.png';
import './comment.module.scss';
import styles from './comment.module.scss';
import Content from "../Content/Content.tsx";
import {useEffect, useState} from "react";
import {getFormattedDate} from "../../../lib/utils/tools.ts";
import OptionsMenu from "../OptionsMenu/OptionsMenu.tsx";
import Popup from "../../Reusable/Popup/Popup.tsx";
import Editor from "../Editor/Editor.tsx";
import {getSubCommentsOnComment} from "../../../api/subComments.ts";
import {CommentBack} from "../PostPage/PostPage.tsx";
import LoaderDots from "../../Reusable/LoaderDots/LoaderDots.tsx";
import {Link} from "react-router-dom";
import down_vote from "../../../assets/down-vote-outline.svg"
import upvote from "../../../assets/up-vote-outline.svg"
import reply from "../../../assets/reply.svg"

export default function Comment({info, deleteComment, type}: {info: CommentInfo, deleteComment: (commentId: number) => void, type: "COMMENT" | "SUB-COMMENT"}) {
    const [showReplyPopUp, setShowReplyPopUp] = useState<boolean>(false);
    const [dateText, setDateText] = useState<string>("");
    const [repliesShown, setRepliesShown] = useState<boolean>(false);
    const [subComments, setSubComments] = useState<CommentInfo[]>([]);
    const [totalSubComments, setTotalSubComments] = useState<number>(0);
    const [isLoadingMoreSubComments, setIsLoadingMoreSubComments] = useState<boolean>(false);

    useEffect(() => {
        if (type === "COMMENT") {
            setTotalSubComments(info.commentCount);
            setDateText(getFormattedDate(info.postTime))
        }
    }, [info.postTime]);

    const handleReply = () => {
        setShowReplyPopUp(true)
    }

    const hideReplyPopUp = () => {
        setShowReplyPopUp(false);
    }

    const toggleReplies = () => {
        setRepliesShown((prev) => !prev);
        if (subComments === undefined || subComments.length === 0) {
            getSubCommentsOnComment(info.id, 0).then((res) => {
                setSubComments(res.data.map((cd: CommentBack) => ({
                    attachment: cd.attachment,
                    author: cd.author,
                    authorId: cd.author_id,
                    content: cd.content,
                    displayName: cd.displayname,
                    id: cd.id,
                    likeCount: cd.like_count,
                    commentCount: cd.comment_count,
                    liked: cd.liked,
                    parentId: cd.parent_post_id,
                    pfp: cd.pfp,
                    postTime: cd.post_time,
                })));
            })
        }
    }

    const prependSubComment = (subComment: CommentInfo) => {
        document.body.style.position = "static";
        setTotalSubComments(prev => prev + 1);
        setSubComments(prev => [subComment, ...prev]);
        setShowReplyPopUp(false);
        setRepliesShown(true);
    }

    const handleShowMore = async () => {
        setIsLoadingMoreSubComments(true);
        getSubCommentsOnComment(info.id, subComments.length).then((res) => {
            setSubComments(prev => [
                ...prev,
                ...res.data.map((cd: CommentBack) => ({
                    attachment: cd.attachment,
                    author: cd.author,
                    authorId: cd.author_id,
                    content: cd.content,
                    displayName: cd.displayname,
                    id: cd.id,
                    likeCount: cd.like_count,
                    commentCount: cd.comment_count,
                    liked: cd.like_count,
                    parentId: cd.parent_post_id,
                    pfp: cd.pfp,
                    postTime: cd.post_time,
                }))
            ])
            setIsLoadingMoreSubComments(false);
        })
    }

    return (
        <div className={styles.comment}>
            {showReplyPopUp && (
                <Popup hidePopUp={hideReplyPopUp}>
                    <Editor type={"reply"} parent_id={info.id} prependComment={prependSubComment}/>
                </Popup>
            )}
            <div className={styles.comment__profile_pict}>
                <img src={profilePict} alt="profile picture" />
            </div>
            <div className={styles.comment__content}>
                <div className={styles.comment__content__header}>
                    <Link to={`/user/${info.authorId}`}>
                        <div className={styles.comment__content__header__display_name}>{info.displayName}</div>
                    </Link>
                    <span>•</span>
                    <div className={styles.comment__content__header__time}>{dateText}</div>
                    <div className={styles.comment__content__header__menu}>
                        <OptionsMenu type={"COMMENT"} id={info.id} author={info.author} deleteComment={deleteComment}/>
                    </div>
                </div>
                <div className={styles.comment__content__text}>
                    <Content content={info.content} filename={info.attachment} type={"comment"}/>
                </div>
                <div className={styles.comment__content__footer}>
                    <button className={`${styles.vote_icon} ${styles.btn_hover}`}>
                        <img src={upvote} alt="upvote" />
                    </button>
                    <span className={styles.comment__content__footer__votes}>{info.likeCount}</span>
                    <button className={`${styles.vote_icon} ${styles.btn_hover}`}>
                        <img src={down_vote} alt="downvote" />
                    </button>
                    <button className={`${styles.comment__content__footer__reply} ${styles.btn_hover}`} onClick={() => handleReply()}>
                        <img src={reply} alt="reply" />
                        <span>reply</span>
                    </button>
                </div>
                {info.commentCount > 0 && (
                    <div className={styles.view_comment} onClick={toggleReplies}>
                        {repliesShown ? "hide replies" : `show replies ${totalSubComments}`}
                    </div>
                )}
                {repliesShown && (<>
                    {subComments.map((cur) => (
                        <Comment
                            key={cur.id}
                            info={cur}
                            deleteComment={deleteComment}
                            type="SUB-COMMENT"
                        />
                    ))}
                    {subComments.length && subComments.length < totalSubComments && (
                        <button className={styles.show_more} onClick={handleShowMore}>
                            {isLoadingMoreSubComments ? <LoaderDots /> : "Show More"}
                        </button>
                    )}
                </>)}

            </div>
        </div>
    );
}
