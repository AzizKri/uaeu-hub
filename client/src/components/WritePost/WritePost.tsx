import styles from '../WritePost/WritePost.module.scss';
import Editor from '../Editor/Editor.tsx';

export default function WritePost() {
    return (
        <div className={styles.newPost}>
            <Editor type="post" parent_id={null} handleSubmit={() => null}/>
        </div>
    );
}
