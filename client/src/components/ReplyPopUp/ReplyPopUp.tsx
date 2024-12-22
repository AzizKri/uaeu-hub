import styles from "./ReplyPopUp.module.scss"
import Editor from "../Editor/Editor.tsx";

export default function ReplyPopUp({parent_comment_id, hideReplyPopUp}: {parent_comment_id: number, hideReplyPopUp: () => void}) {

    return (
        <>
            <div className={styles.container}>
            <span className={styles.container__cancel} onClick={() => hideReplyPopUp()}>
                {/*cancel icon*/}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
            </span>
                <Editor type={"reply"} parent_id={parent_comment_id} handleSubmit={hideReplyPopUp}/>
            </div>
            <div className={styles.dark_background}/>
        </>
    )
}
