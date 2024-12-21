import './post.module.scss';
import profilePicture from '../../assets/profile-picture.png';
// import postImage from '../../assets/post-image.png';
import PostFooter from '../PostFooter/PostFooter.tsx';
import Comment from '../Comment/Comment.tsx';
import styles from './post.module.scss';
import {useEffect, useState} from 'react';
import Editor from '../Editor/Editor.tsx';
import {getAttachmentDetails, getCommentsOnPost} from '../../api.ts';
import LoadingImage from "../LoadingImage/LoadingImage.tsx";
import {getFormatedDate} from "../../lib/tools.ts";

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
                                 isPostPage,
                             }: PostInfo) {
    const [dateText, setDateText] = useState<string>('');
    const [showContent, setShowContent] = useState<boolean>(content.length < 300);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [imageDims, setImageDims] = useState<{ width: number, height: number }>({width: 0, height: 0});
    const [error, setError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(filename != null);
    const [comments, setComments] = useState<CommentInfo[]>([]);

    useEffect(() => {
        getCommentsOnPost(id, 0).then((res) => {
            console.log(res.results);
            setComments(res.results);
        })
    }, [id]);

    useEffect(() => {
        setDateText(getFormatedDate(postDate))
    }, [postDate]);

    useEffect(() => {
        if (filename) {
            getAttachmentDetails(filename).then((res) => {
                if (res.status === 200) {
                    const fileType = res.data?.type;
                    if (fileType?.startsWith('image')) {
                        setImageDims({width: res.data?.metadata.width, height: res.data?.metadata.height});
                        setImageSrc(`https://cdn.uaeu.chat/attachments/${filename}`);
                        setError(false);
                    } else {
                        setImageSrc(`https://cdn.uaeu.chat/attachments/${filename}`);
                        setError(false);
                    }
                } else {
                    setError(true);
                    setIsLoading(false);
                }
            }).catch(() => {
                setError(true);
                setIsLoading(false);
            });
        }
    }, [filename]);

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
            <div className={styles.post__content}>
                <a href={`/post/${id}`}>
                    {showContent || isPostPage ? content : <> {content.slice(0, 200)} <span>&#8230;</span> </>}
                </a>
                    {showContent ? '' :
                        <span className={styles.show_more} onClick={() => setShowContent(true)}>show more</span>}
            </div>
            {/*<ReadOnlyEditor content={editorContent} />*/}
            {isLoading && !error && <LoadingImage />}
            {filename != null && !error &&
                <div className={styles.post__image} style={{display: isLoading ? 'none' : 'block', height: imageDims.height, width: imageDims.width}}>
                    <img
                        src={imageSrc}
                        alt="post attachment"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setError(true);
                            setIsLoading(false);
                        }}
                    />
                </div>
            }
            {error && <p>Error Loading the image</p>}
            <PostFooter id={id} likes={likes} comments={comments_count}/>
            <div className={styles.post__write_answer}>
                <Editor type="comment" post_id={id}/>
            </div>
            {comments.map((cur) => <Comment
                info={cur}
            />)}
            {/*<Comment/>*/}
        </div>
    );
}
