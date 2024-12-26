import Popup from "../Popup/Popup.tsx";
import styles from "./SignUpPopUp.module.scss";
export default function SignUpPopUp({onYes, onNo, hideReplyPopUp}: { onYes: () => void, onNo: () => void, hideReplyPopUp: () => void}) {
    return (
        <Popup hideReplyPopUp={hideReplyPopUp}>
        <div className={styles.popupBackdrop}>
            <div className={styles.popupContainer}>
                <h3>Include Your Previous Posts?</h3>
                <p>
                    We noticed you may already have content associated with an
                    anonymous session. Would you like to attach that content to
                    your new account?
                </p>
                <div className={styles.popupButtons}>
                    <button onClick={onYes} className={styles.popupYesBtn}>
                        Yes
                    </button>
                    <button onClick={onNo} className={styles.popupNoBtn}>
                        No
                    </button>
                </div>
            </div>
        </div>
        </Popup>
    );
}
