import './post.module.scss';
import profilePicture from '../../assets/profile-picture.png';
// import postImage from '../../assets/post-image.png';
import PostFooter from '../PostFooter/PostFooter.tsx';
import Comment from '../Comment/Comment.tsx';
import styles from './post.module.scss';
import {useEffect, useState} from 'react';
import Editor from '../Editor/Editor.tsx';
import {getCommentsOnPost} from '../../api.ts';
import {getFormattedDate} from "../../lib/tools.ts";
import Content from "../Content/Content.tsx";

export default function Post({
                                 id,
                                 content,
                                 authorUsername,
                                 authorDisplayName,
                                 pfp,
                                 postDate,
                                 filename,
                                 likes,
                                 comments_count,
                                 type,
                             }: PostInfo) {
    const [dateText, setDateText] = useState<string>('');
    const [comments, setComments] = useState<CommentInfo[]>([]);

    useEffect(() => {
        getCommentsOnPost(id, 0).then((res) => {
            setComments(res.results);
        })
    }, [id]);

    useEffect(() => {
        setDateText(getFormattedDate(postDate))
    }, [postDate]);


    return (
        <div className={styles.post}>
            <div className={styles.post__info_bar}>
                <div className={styles.post__info_bar__profile_pict}>
                    <img src={pfp == undefined ? profilePicture : pfp} alt="profile picture"/>
                </div>
                <div className={styles.post__info_bar__name}>
                    <div className={styles.post__info_bar__name__display_name}>{authorDisplayName}</div>
                    <div className={styles.post__info_bar__name__user_name}>@{authorUsername}</div>
                </div>
                <span>•</span>
                <div className={styles.post__info_bar__time}>{dateText}</div>
            </div>
            <Content id={id} content={content} filename={filename} type={type}/>
            <PostFooter id={id} likes={likes} comments={comments_count}/>
            <div className={styles.post__write_answer}>
                <Editor type="comment" parent_id={id} handleSubmit={() => null}/>
            </div>
            {type === "post-page" && comments.map((cur) => <Comment
                key={cur.id}
                info={cur}
            />)}
        </div>
    );
}
