import './post.module.scss';
import profilePicture from '../../assets/profile-picture.png';
import PostFooter from '../PostFooter/PostFooter.tsx';
import Comment from '../Comment/Comment.tsx';
import styles from './post.module.scss';
import React, {useEffect, useState} from 'react';
import Editor from '../Editor/Editor.tsx';
import {getCommentsOnPost} from '../../api.ts';
import {getFormattedDate} from "../../lib/tools.ts";
import Content from "../Content/Content.tsx";
import {useUser} from "../../lib/hooks.ts";
// import postImage from '../../assets/post-image.png';

export default function Post({postInfo, topCommentInfo}: PostAll) {
    const [dateText, setDateText] = useState<string>('');
    const [comments, setComments] = useState<CommentInfo[]>([]);
    const [optionsDisplayed, setOptionsDisplayed] = useState<boolean>(false);
    const {user} = useUser();

    useEffect(() => {
        if (postInfo.type === "post-page") {
            getCommentsOnPost(postInfo.id, 0).then((res) => {
                setComments(res.results);
            })
        }
    }, [postInfo.id, postInfo.type]);

    useEffect(() => {
        setDateText(getFormattedDate(postInfo.postDate))
    }, [postInfo.postDate]);

    const handleClickOptions: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        setOptionsDisplayed(true);
        const listener = () => {
            setOptionsDisplayed(false)
            document.removeEventListener('click', listener);
        };
        document.addEventListener('click', listener);
    }

    return (<div className={styles.post}>
        <div className={styles.post__info_bar}>
            <div className={styles.post__info_bar__profile_pict}>
                <img src={postInfo.pfp == undefined ? profilePicture : postInfo.pfp} alt="profile picture"/>
            </div>
            <div className={styles.post__info_bar__name}>
                <div className={styles.post__info_bar__name__display_name}>{postInfo.authorDisplayName}</div>
                <div className={styles.post__info_bar__name__user_name}>@{postInfo.authorUsername}</div>
            </div>
            <span className={styles.post__info_bar__dot}>•</span>
            <div className={styles.post__info_bar__time}>{dateText}</div>
            <div className={styles.post__info_bar__dots} onClick={handleClickOptions}>
                {optionsDisplayed && <ul className={styles.post__info_bar__dots__options_menu}>
                    {user && user.username === postInfo.authorUsername ? (
                        <>
                            <li className={styles.post__info_bar__dots__options_menu__option}>
                                <div className={styles.icon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="currentColor"><path d="M17,18L12,15.82L7,18V5H17M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z" /></svg>
                                </div>
                                <span>Save</span>
                            </li>
                            <li className={styles.post__info_bar__dots__options_menu__option}>
                                <div className={styles.icon}>
                                    {/*report flag icon*/}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px"
                                         width="24px" color="currentColor">
                                        <path
                                            d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                                    </svg>
                                </div>
                                <span>Delete</span>
                            </li>
                        </>
                    ) : (
                        <li className={styles.post__info_bar__dots__options_menu__option}>
                            <div className={styles.icon}>
                                {/*report flag icon*/}
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                                     width="24px"
                                     fill="currentColor">
                                    <path
                                        d="M220-130v-650h323.84l16 80H780v360H536.16l-16-80H280v290h-60Zm280-430Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                                </svg>
                            </div>
                            <span>Report</span>
                        </li>
                    )}
                </ul>}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"
                     fill="currentColor">
                    <path
                        d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"/>
                </svg>
            </div>
        </div>
        <Content id={postInfo.id} content={postInfo.content} filename={postInfo.filename} type={postInfo.type}/>
        <PostFooter
            id={postInfo.id}
            likes={postInfo.likeCount}
            comments={postInfo.commentCount}
            isLiked={postInfo.liked}
        />
        <div className={styles.post__write_answer}>
            <Editor type="comment" parent_id={postInfo.id} handleSubmit={() => null}/>
        </div>
        {postInfo.type === "post-page" ? comments.map((cur) => <Comment
            key={cur.id}
            info={cur}
        />) : postInfo.type === "post" && topCommentInfo != null ? <Comment info={topCommentInfo}/> : null}
    </div>);
}
