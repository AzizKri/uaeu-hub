import styles from "../WritePost/WritePost.module.scss";
import Editor from "../Editor/Editor.tsx";

export default function WritePost() {
    return (
        <div className={styles.newPost}>
            <Editor placeholder="Write your question" type="post"/>
        </div>
    )
}