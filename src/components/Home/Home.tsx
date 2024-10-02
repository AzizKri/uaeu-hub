import Question from "../Question/Question.tsx";
import styles from "./Home.module.scss";

export default function Home() {
    return (
        <>
            <div>
                <h3>Home</h3>
                <div className={styles.newPost}>
                    <input title="search" placeholder="What's your question?" className={styles.input}/>
                    <div className={styles.buttons}>
                        <div className={styles.buttonIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                                 fill="currentColor">
                                <path
                                    d="M480-480ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-320h80v320q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/>
                            </svg>
                        </div>
                        <div className={styles.buttonIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                                 fill="currentColor">
                                <path
                                    d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <h3>Recent Questions</h3>
            <span>20 new questions</span>

            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
            <Question/>
        </>
    )
}