import styles from "./Right.module.scss";
import communityIcon from "../../assets/community-icon.jpg"

export default function Right() {
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                Trending Communities
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                >
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
                </svg>
            </div>
            <ul className={styles.list}>
                <li className={styles.community}>
                    <img
                        src={communityIcon}
                        alt="Community Icon"
                        className={styles.communityIcon}
                    />
                    <span className={styles.communityName}>Community name</span>
                </li>
                <li className={styles.community}>
                    <img
                        src={communityIcon}
                        alt="Community Icon"
                        className={styles.communityIcon}
                    />
                    <span className={styles.communityName}>Community name</span>
                </li>
                <li className={styles.community}>
                    <img
                        src={communityIcon}
                        alt="Community Icon"
                        className={styles.communityIcon}
                    />
                    <span className={styles.communityName}>Community name</span>
                </li>
                <li className={styles.community}>
                    <img
                        src={communityIcon}
                        alt="Community Icon"
                        className={styles.communityIcon}
                    />
                    <span className={styles.communityName}>Community name</span>
                </li>
                <li className={styles.community}>
                    <img
                        src={communityIcon}
                        alt="Community Icon"
                        className={styles.communityIcon}
                    />
                    <span className={styles.communityName}>Community name</span>
                </li>
                <li className={styles.community}>
                    <img
                        src={communityIcon}
                        alt="Community Icon"
                        className={styles.communityIcon}
                    />
                    <span className={styles.communityName}>Community name</span>
                </li>
            </ul>
        </div>
    );
}
