import './post.module.scss';
import profilePicture from '../../assets/profile-picture.png';
import PostFooter from '../PostFooter/PostFooter.tsx';
import Comment from '../Comment/Comment.tsx';
import styles from './post.module.scss';
import {useEffect, useState} from 'react';
import Editor from '../Editor/Editor.tsx';
import {getCommentsOnPost} from '../../api.ts';
import {getFormattedDate} from "../../lib/tools.ts";
import Content from "../Content/Content.tsx";
// import postImage from '../../assets/post-image.png';

export default function Post({post_info, top_comment_info}: PostAll) {
    const [dateText, setDateText] = useState<string>('');
    const [comments, setComments] = useState<CommentInfo[]>([]);

    useEffect(() => {
        if (post_info.type === "post-page") {
            getCommentsOnPost(post_info.id, 0).then((res) => {
                setComments(res.results);
            })
        }
    }, [post_info.id, post_info.type]);

    useEffect(() => {
        setDateText(getFormattedDate(post_info.postDate))
    }, [post_info.postDate]);


    return (
        <div className={styles.post}>
            <div className={styles.post__info_bar}>
                <div className={styles.post__info_bar__profile_pict}>
                    <img src={post_info.pfp == undefined ? profilePicture : post_info.pfp} alt="profile picture"/>
                </div>
                <div className={styles.post__info_bar__name}>
                    <div className={styles.post__info_bar__name__display_name}>{post_info.authorDisplayName}</div>
                    <div className={styles.post__info_bar__name__user_name}>@{post_info.authorUsername}</div>
                </div>
                <span>•</span>
                <div className={styles.post__info_bar__time}>{dateText}</div>
            </div>
            <Content id={post_info.id} content={post_info.content} filename={post_info.filename} type={post_info.type}/>
            <PostFooter id={post_info.id} likes={post_info.like_count} comments={post_info.comment_count} isLiked={post_info.liked}/>
            <div className={styles.post__write_answer}>
                <Editor type="comment" parent_id={post_info.id} handleSubmit={() => null}/>
            </div>
            {post_info.type === "post-page" ? comments.map((cur) => <Comment
                key={cur.id}
                info={cur}
            />) : post_info.type === "post" && top_comment_info != null ? <Comment info={top_comment_info}/> : null}
        </div>
    );
}
