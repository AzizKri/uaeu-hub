import profilePict from '../../assets/profile-picture.png';
import './comment.module.scss';
import styles from './comment.module.scss';
import Content from "../Content/Content.tsx";
import ReplyPopUp from "../ReplyPopUp/ReplyPopUp.tsx";
import {useEffect, useState} from "react";
import {getFormattedDate} from "../../lib/tools.ts";

export default function Comment({info}: {info: CommentInfo}) {
    const [showReplyPopUp, setShowReplyPopUp] = useState<boolean>(false);
    const [dateText, setDateText] = useState<string>("");
    const [repliesShown, setRepliesShown] = useState<boolean>(false);
    const comment_count = 2;

    useEffect(() => {
        setDateText(getFormattedDate(info.post_time))
    }, [info.post_time]);

    const handleReply = () => {
        console.log("handle reply");
        document.body.style.overflow = "hidden";
        setShowReplyPopUp(true)
    }

    const hideReplyPopUp = () => {
        document.body.style.overflow = "scroll";
        setShowReplyPopUp(false);
    }

    const toggleReplies = () => {
        setRepliesShown((prev) => !prev);
        /**
         *  TODO: add a component to hold the replies and show it based on the state of repliesShown
         *  if it is the first time to show them you need to first get them
         */
    }

    return (
        <div className={styles.comment}>
            {showReplyPopUp && <ReplyPopUp parent_comment_id={info.id} hideReplyPopUp={hideReplyPopUp}/>}
            <div className={styles.comment__profile_pict}>
                <img src={profilePict} alt="profile picture" />
            </div>
            <div className={styles.comment__content}>
                <div className={styles.comment__content__header}>
                    <div className={styles.comment__content__header__display_name}>{info.display_name}</div>
                    <span>•</span>
                    <div className={styles.comment__content__header__time}>{dateText}</div>
                </div>
                <div className={styles.comment__content__text}>
                    <Content id={info.id} content={info.content} filename={info.attachment} type={"comment"}/>
                </div>
                <div className={styles.comment__content__footer}>
                    <button className={`${styles.vote_icon} ${styles.btn_hover}`}>
                        <svg fill="currentColor" height="16" icon-name="upvote-outline" viewBox="0 0 20 20"
                             width="16" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8ZM2.227 9.784l-.012.016c.01-.006.014-.01.012-.016Z"></path>
                        </svg>
                    </button>
                    <span className={styles.comment__content__footer__votes}>{info.like_count}</span>
                    <button className={`${styles.vote_icon} ${styles.btn_hover}`}>
                        <svg fill="currentColor" height="16" icon-name="downvote-outline" viewBox="0 0 20 20"
                             width="16" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Zm15.469-.05c-.01 0-.014.007-.012.013l.012-.013Z"></path>
                        </svg>
                    </button>
                    <button className={`${styles.comment__content__footer__reply} ${styles.btn_hover}`} onClick={() => handleReply()}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"
                             fill="#5f6368">
                            <path
                                d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
                        </svg>
                        <span>reply</span>
                    </button>
                </div>
                {comment_count > 0 && <div className={styles.view_comment} onClick={() => toggleReplies()}>{`${repliesShown ? "hide" : "view"} replies (${comment_count})`}</div>}
            </div>
        </div>
    );
}
