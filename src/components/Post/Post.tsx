import "./post.module.scss"
import profilePicture from "../../assets/profile-picture.png"
import postImage from "../../assets/post-image.png"
import PostFooter from "../PostFooter/PostFooter.tsx";
// import Comment from "../Comment/Comment.tsx";
import styles from "./post.module.scss";
import {useState} from "react";

export default function Post({content}: {content: string}) {
    // let partContent: string = "";
    // const []
    const [showContent, setShowContent] = useState<boolean>(content.length < 300);

    return (
        <div className={styles.post}>
            {/*<div className={styles.post__wrapper}>*/}
                {/*<div className={styles.post__header}>*/}
                {/*    <button className={styles.post__header__btn_back}>*/}
                {/*        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 400 800" width="11.78px"*/}
                {/*             fill="#5f6368">*/}
                {/*            <path d="M400 0L0 400l400 400 71-71-329-329 329-329L400 0Z"/>*/}
                {/*        </svg>*/}
                {/*    </button>*/}
                {/*    <span className={styles.post__header__title}>Post</span>*/}
                {/*    <button className={styles.post__header_btn_options}>*/}
                {/*        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"*/}
                {/*             fill="#5f6368">*/}
                {/*            <path*/}
                {/*                d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/>*/}
                {/*        </svg>*/}
                {/*    </button>*/}
                {/*</div>*/}
            {/*</div>*/}
            <div className={styles.post__info_bar}>
                <div className={styles.post__info_bar__profile_pict}>
                     <img src={profilePicture}  alt="profile picture"/>
                 </div>
                <div className={styles.post__info_bar__name}>
                    <div className={styles.post__info_bar__name__display_name}>Display Name</div>
                    <div className={styles.post__info_bar__name__user_name}>@username</div>
                </div>
                <span>•</span>
                <div className={styles.post__info_bar__time}>3hr.ago</div>
            </div>
            <div className={styles.post__content}>
                {showContent ? content : <> {content.slice(0, 200)} <span>&#8230;</span> </>}
                {showContent ? "" : <span className={styles.show_more} onClick={() => setShowContent(true)}>show more</span>}
            </div>
            <div className={styles.post__image}>
                <img src={postImage} alt="profile picture"/>
            </div>
            <PostFooter />
            {/* TODO use spacy instead of an input */}
            <div className={styles.post__write_answer}>
                <input className={styles.post__write_answer__input} type="text" placeholder="Write your answer" />
                <button className={`${styles.post__write_answer__post} ${styles.btn_hover}`}>Post</button>
            </div>
            {/*<Comment />*/}
        </div>
    )
}