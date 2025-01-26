import styles from './WritePost.module.scss';
import Editor from '../Editor/Editor.tsx';
import {useUpdatePosts} from "../../../contexts/updatePosts/UpdatePostsContext.ts";

export default function WritePost() {
    const {prependPost} = useUpdatePosts();
    return (
        <div className={styles.newPost}>
            <Editor type="POST" prependPost={prependPost} />
        </div>
    );
}
