import styles from "./UserPostsSkeleton.module.scss";

export default function UserPostsSkeleton() {
    return (
        <div className={styles.postSkeleton}>
            <div className={styles.lineSkeleton} style={{width: "30%"}}/>
            <div className={styles.lineSkeleton} style={{width: "80%"}}/>
            <div className={styles.lineSkeleton} style={{width: "90%"}}/>
        </div>
    );
}
