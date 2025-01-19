import styles from "./ThreeDotsLine.module.scss";

export default function ThreeDotsLine() {

    return (
        <div className={styles.loader}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
        </div>
    )
}
