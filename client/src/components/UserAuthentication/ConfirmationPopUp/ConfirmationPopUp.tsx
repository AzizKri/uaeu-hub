import styles from "./ConfirmationPopUp.module.scss";
import Modal from "../../Reusable/Modal/Modal.tsx";
import successLogo from "../../../assets/check-mark-svgrepo.svg";
import failLogo from "../../../assets/cross-mark-button-svgrepo.svg";
import {useEffect} from "react";
interface ConfirmationPopUpProps {
    confirmation: string;
    text: string;
    success: boolean;
    onClose: () => void;
    duration?: number;
}

export default function ConfirmationPopUp({
                                              confirmation,
                                              text,
                                              success,
                                              onClose,
                                              duration = 1500,
                                          }: ConfirmationPopUpProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <Modal onClose={onClose}>
            <div className={styles.container}>
                <img
                    src={success ? successLogo : failLogo}
                    className={styles.verificationIcon}
                    alt="verification icon"
                />
                <h2 className={styles.confirmationHeader}>{confirmation}</h2>
                <p className={styles.confirmationText}>{text}</p>
            </div>
        </Modal>
    );
}
