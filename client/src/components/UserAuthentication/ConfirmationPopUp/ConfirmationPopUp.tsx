import styles from "./ConfirmationPopUp.module.scss";
import Modal from "../../Reusable/Modal/Modal.tsx";
import successLogo from "../../../assets/check-mark-svgrepo.svg";
import failLogo from "../../../assets/cross-mark-button-svgrepo.svg";

export default function ConfirmationPopUp({confirmation, text, success, onClose} : {confirmation: string, text: string, success: boolean, onClose: () => void}) {
    return (
        <Modal onClose={onClose}>
            <div className={styles.container}>
                <img src={success ? successLogo : failLogo} className={styles.verificationIcon} alt="success logo"/>
                <h2 className={styles.confirmationHeader}>{confirmation}</h2>
                <p className={styles.confirmationText}>{text}</p>
            </div>
        </Modal>
    )
}
