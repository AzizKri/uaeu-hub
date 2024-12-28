import Popup from "../Popup/Popup.tsx";
import styles from "./YesNoPopUp.module.scss";

export default function YesNoPopUp({title, text, onYes, onNo, hidePopUp}: { title: string, text: string, onYes: () => void, onNo: () => void, hidePopUp: () => void}) {
    const handleHidePopUp = () => {
        document.body.style.overflow = "scroll";
        hidePopUp();
    }

    const handleYes = () => {
        handleHidePopUp();
        onYes()
    }

    const handleNo = () => {
        handleHidePopUp();
        onNo()
    }

    return (
        <Popup hidePopUp={hidePopUp}>
            <div className={styles.popupBackdrop}>
                <div className={styles.popupContainer}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <div className={styles.popupButtons}>
                        <button onClick={handleNo} className={styles.popupNoBtn}>
                            No
                        </button>
                        <button onClick={handleYes} className={styles.popupYesBtn}>
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </Popup>
    );
}
