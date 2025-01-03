import styles from "./LoadingImage.module.scss";

export default function LoadingImage() {
    return (
        <div className={styles.container}>
            <div className={styles.loader}></div>
        </div>
    )
}
