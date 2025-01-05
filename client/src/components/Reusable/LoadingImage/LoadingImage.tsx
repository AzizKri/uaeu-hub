import styles from "./LoadingImage.module.scss";

export default function LoadingImage({width}: {width: string}) {
    return (
        <div className={styles.container}>
            <div className={styles.loader} style={{width: width, height: width}}></div>
        </div>
    )
}
