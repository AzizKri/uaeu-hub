import styles from "./NavigationFallback.module.scss";
import LineSpinner from "../Animations/LineSpinner/LineSpinner.tsx";


export default function NavigationFallback() {
    return (
        <div className={styles.navigationFallback}>
            <div className={styles.spinnerContainer}>
                <LineSpinner 
                    spinnerRadius="30px" 
                    spinnerThickness="4px"
                    containerHeight="100px"
                />
            </div>
            <p className={styles.loadingText}>Loading...</p>
        </div>
    );
}
