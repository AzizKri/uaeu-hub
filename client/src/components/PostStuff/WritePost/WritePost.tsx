import styles from './WritePost.module.scss';
import Editor from '../Editor/Editor.tsx';
import {useUpdatePosts} from "../../../lib/utils/hooks.ts";

export default function WritePost() {
    const {prependPost} = useUpdatePosts();
    return (
        <div className={styles.newPost}>
            <Editor type="post" prependPost={prependPost} />
        </div>
    );
}
