import styles from "./EightDotsSpinner.module.scss"

export default function EightDotsSpinner() {
    return (
        <div className={styles.container}>
            <div className={styles.loader}>
                <span className={styles.inner}></span>
                <span className={styles.inner}></span>
                <span className={styles.inner}></span>
                <span className={styles.inner}></span>
                <span className={styles.inner}></span>
                <span className={styles.inner}></span>
                <span className={styles.inner}></span>
                <span className={styles.inner}></span>
            </div>
        </div>
    );
}
