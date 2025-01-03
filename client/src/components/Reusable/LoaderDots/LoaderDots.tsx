import styles from "./LoaderDots.module.scss";

export default function LoaderDots() {

    return (
        <div className={styles.loader}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
        </div>
    )
}
