import { useState } from 'react';
import styles from './EditUserPopUp.module.scss';
import Modal from "../../Reusable/Modal/Modal.tsx";

interface EditUserPopUpProps {
    onClose: () => void;
    currentDisplayName: string;
    currentBio: string;
    onSave: (updatedDisplayName: string, updatedBio: string) => void;
}

export default function EditUserPopUp({
                                          onClose,
                                          currentDisplayName,
                                          currentBio,
                                          onSave
                                      }: EditUserPopUpProps) {
    const [displayName, setDisplayName] = useState(currentDisplayName);
    const [bio, setBio] = useState(currentBio);

    const handleSave = () => {
        onSave(displayName, bio);
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className={styles.container}>
                <h2 className={styles.editHeader}>Edit Profile</h2>
                <label htmlFor="displayName" className={styles.editLabel}>Display Name</label>
                <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    className={styles.editInput}
                    onChange={(e) => setDisplayName(e.target.value)}
                />

                <label htmlFor="bio" className={styles.editLabel}>Bio</label>
                <textarea
                    id="bio"
                    value={bio}
                    className={styles.editTextArea}
                    onChange={(e) => setBio(e.target.value)}
                />

                <div className={styles.buttons}>
                    <button onClick={handleSave} className={styles.saveButton}>
                        Save
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}
