import {useState} from 'react';
import styles from './EditUserPopUp.module.scss';
import Modal from "../../Reusable/Modal/Modal.tsx";
import ImageUploader from "../../Reusable/ImageUploader/ImageUploader.tsx";

interface EditUserPopUpProps {
    onClose: () => void;
    currentProfilePicture?: string;
    currentDisplayName: string;
    currentBio: string;
    onSave: (updatedDisplayName: string, updatedBio: string, updatedPfp: string) => void;
}

export default function EditUserPopUp({
                                          onClose,
                                          currentProfilePicture,
                                          currentDisplayName,
                                          currentBio,
                                          onSave
                                      }: EditUserPopUpProps) {
    const [displayName, setDisplayName] = useState(currentDisplayName);
    const [bio, setBio] = useState(currentBio);
    const [uploadState, setUploadState] = useState<UploadState>({
            status: "IDLE",
            file: null,
            preview: currentProfilePicture,
            fileName: currentProfilePicture
        }
    );

    const handleSave = () => {
        onSave(displayName, bio, (uploadState?.fileName ? uploadState.fileName : ''));
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className={styles.container}>
                <h2 className={styles.editHeader}>Edit Profile</h2>
                <ImageUploader uploadState={uploadState} setUploadState={setUploadState} type="PROFILE"/>
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
                    <button onClick={handleSave} className={styles.saveButton} disabled={uploadState.status === "UPLOADING"}>
                        Save
                    </button>
                    <button onClick={onClose} className={styles.cancelButton} disabled={uploadState.status === "UPLOADING"}>
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}
