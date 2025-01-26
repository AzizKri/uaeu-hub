import styles from "./LoadingFallback.module.scss";
import logo from "../../../assets/logo-text-2.svg";

export default function LoadingFallback() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.logoWrapper}>
                <img
                    src={logo}
                    alt="Chat Logo"
                    className={styles.logo}
                />
            </div>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading your experience...</p>
        </div>
    );
}
