import styles from './Question.module.scss'
import PostFooter from "../PostFooter/PostFooter.tsx";

export default function Question() {
    return (
        <div className={styles.questionWrapper}>
            <div className={styles.question}>
                <div className={styles.user}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em" viewBox="0 0 24 24">
                        <path fill="currentColor"
                              d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/>
                    </svg>
                    <span>User12345</span>
                </div>
                <span className={styles.header}>Who wants to join my wants to join my wants to join my minecraft server???</span>
                <PostFooter/>
            </div>
        </div>
    )
}

