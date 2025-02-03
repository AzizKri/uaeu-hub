import styles from "../EditUserPopUp/EditUserPopUp.module.scss";
import {useState} from "react";

export default function ChangePassword({onClose} : {onClose: () => void}){
    const [currPassword, setCurrPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSave = () => {
        onClose();
        setIsLoading(false);
    }

    return (
        <>
            <label htmlFor="currPassword" className={styles.editLabel}>Current Password</label>
            <input
                type="password"
                id="currPassword"
                value={currPassword}
                className={styles.editInput}
                onChange={(e) => setCurrPassword(e.target.value)}
            />

            <label htmlFor="newPassword" className={styles.editLabel}>New Password</label>
            <input
                type="password"
                id="newPassword"
                value={newPassword}
                className={styles.editInput}
                onChange={(e) => setNewPassword(e.target.value)}
            />

            <label htmlFor="confirmPassword" className={styles.editLabel}>Confirm Password</label>
            <input
                type="password"
                id="newPassword"
                value={confirmPassword}
                className={styles.editInput}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className={styles.buttons}>
                <button onClick={handleSave} className={styles.saveButton} disabled={isLoading}>
                    Confirm
                </button>
                <button onClick={onClose} className={styles.cancelButton} disabled={isLoading}>
                    Cancel
                </button>
            </div>
        </>
    )
}
