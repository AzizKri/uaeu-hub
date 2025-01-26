import styles from "./UserProfileSkeleton.module.scss";

export default function UserProfileSkeleton() {
    return (
        <div className={styles.skeletonContainer}>
            <div className={styles.headerSkeleton}>
                <div className={styles.avatarSkeleton} />
                <div className={styles.textGroup}>
                    <div className={styles.lineSkeleton} />
                    <div className={styles.lineSkeleton} style={{ width: "60%" }} />
                </div>
            </div>

            <div className={styles.tabsSkeleton}>
                <div className={styles.tabSkeleton} />
                <div className={styles.tabSkeleton} />
                <div className={styles.tabSkeleton} />
            </div>
        </div>
    );
}
