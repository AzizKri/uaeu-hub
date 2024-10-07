import "./post.module.scss"
import profilePicture from "../../assets/profile-picture.png"
import postImage from "../../assets/post-image.png"
import PostFooter from "../PostFooter/PostFooter.tsx";
// import Comment from "../Comment/Comment.tsx";
import styles from "./post.module.scss";
import {useEffect, useState} from "react";

export default function Post({content, authorUsername, authorDisplayName, pfp, postDate}: PostInfo) {
    // let partContent: string = "";
    // const []
    const [showContent, setShowContent] = useState<boolean>(content.length < 300);
    const [dateText, setDateText] = useState<string>("");
    useEffect(() => {
        console.log(postDate);
        const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const crntDate: Date = new Date();
        if (crntDate.getFullYear() === postDate.getFullYear()) {
            if (crntDate.getMonth() === postDate.getMonth() && crntDate.getDate() === postDate.getDate()) {
                if (crntDate.getHours() === postDate.getHours()) {
                    if (crntDate.getMinutes() === postDate.getMinutes()) {
                        setDateText(`${new Date(crntDate.getTime() - postDate.getTime()).getSeconds()}sec.ago`)
                    } else {
                        setDateText(`${new Date(crntDate.getTime() - postDate.getTime()).getMinutes()}min.ago`)
                    }
                } else {
                    setDateText(`${new Date(crntDate.getTime() - postDate.getTime()).getHours()}hr.ago`)
                }
            } else {
                setDateText(`${months[postDate.getMonth()]} ${postDate.getDate()}`);
            }
        } else {
            setDateText(`${months[postDate.getMonth()]} ${postDate.getDate()}, ${postDate.getFullYear()}`);
        }
    }, [postDate])

    return (
        <div className={styles.post}>
            <div className={styles.post__info_bar}>
                <div className={styles.post__info_bar__profile_pict}>
                     <img src={pfp == undefined? profilePicture : pfp}  alt="profile picture"/>
                 </div>
                <div className={styles.post__info_bar__name}>
                    <div className={styles.post__info_bar__name__display_name}>{authorDisplayName}</div>
                    <div className={styles.post__info_bar__name__user_name}>@{authorUsername}</div>
                </div>
                <span>•</span>
                <div className={styles.post__info_bar__time}>{dateText}</div>
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