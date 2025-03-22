import styles from "./Skeleton.module.scss";

type SkeletonProps = {
    type: "post" | "community" | "notification";
};

export default function Skeleton({ type }: SkeletonProps) {
    if (type === "post") {
        return (
            <div className={styles.postSkeleton}>
                <div className={styles.lineSkeleton} style={{ width: "30%" }} />
                <div className={styles.lineSkeleton} style={{ width: "80%" }} />
                <div className={styles.lineSkeleton} style={{ width: "90%" }} />
            </div>
        );
    } else if (type === "community") {
        return (
            <div className={styles.communitySkeleton}>
                <div className={styles.avatarSkeleton} />
                <div className={styles.lineSkeleton} style={{ width: "60%" }} />
            </div>
        );
    } else if (type === "notification") {
        return (
            <div className={styles.lineSkeleton} style={{width: "90%"}}/>
        );
    }
    return null;
}
