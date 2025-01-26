import styles from "./UserCommunitiesSkeleton.module.scss";

export default function UserCommunitiesSkeleton() {
    return (
        <div className={styles.headerSkeleton}>
            <div className={styles.avatarSkeleton}/>
            <div className={styles.lineSkeleton} style={{width: "60%"}}/>
        </div>
    );
}
