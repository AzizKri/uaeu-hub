import styles from "./YesNoPopUp.module.scss";
import Modal from "../Modal/Modal.tsx";

export default function YesNoPopUp({title, text, onYes, onNo, hidePopUp, yesText = "Yes", noText = "No"}: {
    title: string,
    text: string,
    onYes: () => void,
    onNo: () => void,
    hidePopUp: () => void,
    yesText?: string,
    noText?: string
}) {
    const handleHidePopUp = () => {
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
        <Modal onClose={hidePopUp}>
            <div className={styles.popupBackdrop}>
                <div className={styles.popupContainer}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <div className={styles.popupButtons}>
                        <button onClick={handleNo} className={styles.popupNoBtn}>
                            {noText}
                        </button>
                        <button onClick={handleYes} className={styles.popupYesBtn}>
                            {yesText}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
