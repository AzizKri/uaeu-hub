import styles from './PostFooter.module.scss';
import {togglePostLike} from "../../../api/posts.ts";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Modal from "../../Reusable/Modal/Modal.tsx";
import ShareModal from "../ShareModal/ShareModal.tsx";
import likedIcon from "../../../assets/liked.svg"
import unLikedIcon from "../../../assets/unliked.svg"

export default function PostFooter({
    id,
    likes,
    comments,
    isLiked,
    type
}: {
    id: number;
    likes: number;
    comments: number;
    isLiked: boolean;
    type?: string
}) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState<number>(0);
    const [showShareModal, setShowShareModal] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLiked(isLiked);
        setLikesCount(likes);
    }, [isLiked, likes]);

    const handleShare: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: 'UAEU Chat',
                url: `https://uaeu.chat/post/${id}`
            }).then(() => console.log("Shared"))
                .catch(console.error);
        } else {
            setShowShareModal(true);
        }
    };

    const handleToggleLike: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        setLikesCount(prev => prev + (liked ? -1 : 1));
        setLiked(prev => !prev);
        togglePostLike(id);
    };

    const redirectToPost = () => {
        if (type !== "POST-PAGE") navigate(`/post/${id}`);
    };

    return (
        <div className={styles.footer}>
            <div className={styles.footerLeft}>
                {/*likes button*/}
                <div
                    className={styles.footerButton}
                    onClick={handleToggleLike}
                >
                    <img
                        src={liked ? likedIcon : unLikedIcon}
                        alt="like"
                        className={styles.buttonIcon}
                    />
                    <div className={styles.buttonNumber}>
                        <span>{likesCount}</span>
                    </div>
                </div>
                {/*comments button*/}
                <div
                    className={styles.footerButton}
                    onClick={() => redirectToPost()}
                >
                    <div className={styles.buttonIcon}>
                        {/*comment icon*/}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.2em"
                            height="1.2em"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1"
                            />
                        </svg>
                    </div>
                    <div className={styles.buttonNumber}>
                        <span>{comments}</span>
                    </div>
                </div>
            </div>
            <div className={styles.footerRight}>
                <div className={styles.footerButton} onClick={handleShare}>
                    <div className={styles.buttonIcon}>
                        {/*share icon*/}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="1.4em"
                            viewBox="0 -960 960 960"
                            width="1.4em"
                            fill="currentColor"
                        >
                            <path d="M632.43-136q-39.81 0-67.51-27.82-27.69-27.82-27.69-67.56 0-9 6.31-31.31L299.62-414.62q-12.93 14-30.77 22t-38.23 8q-39.43 0-67.02-28.07Q136-440.77 136-480q0-39.23 27.6-67.31 27.59-28.07 67.02-28.07 20.48 0 38.28 8 17.79 8 30.72 22l243.92-151.16q-2.77-7.77-4.54-15.73-1.77-7.96-1.77-16.35 0-39.74 27.87-67.56Q592.98-824 632.8-824q39.82 0 67.51 27.87Q728-768.25 728-728.43q0 39.81-27.82 67.51-27.82 27.69-67.56 27.69-20.7 0-38-8.39Q577.31-650 564.38-664L320.46-512.08q2.77 7.77 4.54 15.74 1.77 7.96 1.77 16.34 0 8.38-1.77 16.34-1.77 7.97-4.54 15.74L564.38-296q12.93-14 30.28-22.38 17.35-8.39 37.96-8.39 39.74 0 67.56 27.87Q728-271.02 728-231.2q0 39.82-27.87 67.51Q672.25-136 632.43-136Zm.19-32q26.93 0 45.16-18.22Q696-204.45 696-231.38q0-26.94-18.22-45.17-18.23-18.22-45.16-18.22-26.94 0-45.17 18.22-18.22 18.23-18.22 45.17 0 26.93 18.22 45.16Q605.68-168 632.62-168Zm-402-248.62q27.26 0 45.7-18.22 18.45-18.22 18.45-45.16 0-26.94-18.45-45.16-18.44-18.22-45.7-18.22-26.62 0-44.62 18.22-18 18.22-18 45.16 0 26.94 18 45.16 18 18.22 44.62 18.22Zm402-248.61q26.93 0 45.16-18.22Q696-701.68 696-728.62q0-26.93-18.22-45.16Q659.55-792 632.62-792q-26.94 0-45.17 18.22-18.22 18.23-18.22 45.16 0 26.94 18.22 45.17 18.23 18.22 45.17 18.22Zm0 433.85ZM231.38-480Zm401.24-248.62Z" />
                        </svg>
                    </div>
                </div>
                <div className={styles.modalContainer}>
                    {showShareModal && (
                        <Modal onClose={() => setShowShareModal(false)}>
                            <ShareModal id={id} />
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
}
