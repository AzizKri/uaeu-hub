import styles from '../WritePost/WritePost.module.scss';
import Editor from '../Editor/Editor.tsx';
import {useUpdatePosts} from "../../lib/hooks.ts";

export default function WritePost() {
    const {prependPost} = useUpdatePosts();
    return (
        <div className={styles.newPost}>
            <Editor type="post" parent_id={null} handleSubmit={() => null} prependPost={prependPost} />
        </div>
    );
}
