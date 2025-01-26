import styles from "./LineSpinner.module.scss";

export default function LineSpinner({width}: {width: string}) {
    return (
        <div className={styles.container}>
            <div className={styles.loader} style={{width: width, height: width}}></div>
            <div className={styles.inner} style={{width: width, height: width}}></div>
        </div>
    )
}
