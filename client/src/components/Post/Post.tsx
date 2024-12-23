import profilePicture from '../../assets/profile-picture.png';
import PostFooter from '../PostFooter/PostFooter';
import Comment from '../Comment/Comment';
import styles from './post.module.scss';
import {useEffect, useState} from 'react';
import Editor from '../Editor/Editor';
import {getCommentsOnPost} from '../../api';
import Content from "../Content/Content";
import {formatRelativeTime} from "../../lib/tools";

export default function Post(post: PostInfo) {
    const [comments, setComments] = useState<CommentInfo[]>([]);

    useEffect(() => {
        getCommentsOnPost(post.id, 0).then((res) => {
            setComments(res.results);
        })
    }, [post.id]);


    return (
        <div className={styles.post}>
            <div className={styles.post__info_bar}>
                <div className={styles.post__info_bar__profile_pict}>
                    <img src={post.author.pfp ?? profilePicture} alt="profile picture"/>
                </div>
                <div className={styles.post__info_bar__name}>
                    <div className={styles.post__info_bar__name__display_name}>{post.author.displayname}</div>
                    <div className={styles.post__info_bar__name__user_name}>@{post.author.username}</div>
                </div>
                <span>•</span>
                <div className={styles.post__info_bar__time}>{formatRelativeTime(post.date)}</div>
            </div>
            <Content id={post.id} content={post.content} filename={post.filename} type={post.type}/>
            <PostFooter id={post.id} likes={post.likes} comments={post.comments_count}/>
            <div className={styles.post__write_answer}>
                <Editor type="comment" parent_id={post.id} handleSubmit={() => null}/>
            </div>
            {post.type === "post-page" && comments.map((cur) => <Comment
                key={cur.id}
                info={cur}
            />)}
        </div>
    );
}
