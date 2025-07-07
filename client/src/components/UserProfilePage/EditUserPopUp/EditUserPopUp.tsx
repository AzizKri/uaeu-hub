import {useState} from 'react';
import styles from './EditUserPopUp.module.scss';
import Modal from "../../Reusable/Modal/Modal.tsx";
import EditProfile from "../UserProfileSettings/EditProfile.tsx";
import ChangePassword from "../UserProfileSettings/ChangePassword.tsx";
import ChangeEmail from "../UserProfileSettings/ChangeEmail.tsx";

type tab = "Edit Profile" | "Change Email" | "Change Password"

const settingsTabs: {label: tab }[] = [
    { label: "Edit Profile" },
    // { label: "Change Email" },
    { label: "Change Password" },
];

interface EditUserPopUpProps {
    onClose: () => void;
    currentProfilePicture?: string;
    currentDisplayName: string;
    currentBio: string;
    currentEmail: string;
    onSaveEditProfile: (updatedDisplayName: string, updatedBio: string, updatedPfp: string) => void;
    onSaveChangePassword: (currPass : string, newPass : string) => void;
    isLoading: boolean;
}

export default function EditUserPopUp({
                                          onClose,
                                          currentProfilePicture,
                                          currentDisplayName,
                                          currentBio,
                                          currentEmail,
                                          onSaveChangePassword,
                                          onSaveEditProfile,
                                          isLoading,
                                      }: EditUserPopUpProps) {
    // const [displayName, setDisplayName] = useState(currentDisplayName);
    // const [bio, setBio] = useState(currentBio);
    const [activeTab, setActiveTab] = useState<tab>("Edit Profile");
    // const [uploadState, setUploadState] = useState<UploadState>({
    //         status: "IDLE",
    //         file: null,
    //         preview: currentProfilePicture,
    //         fileName: currentProfilePicture
    //     }
    // );

    // const handleSave = () => {
    //     onSave(displayName, bio, (uploadState?.fileName ? uploadState.fileName : ''));
    //     onClose();
    // };

    const handleTabClick = (tabLabel: tab) => {
        setActiveTab(tabLabel);
    };

    return (
        <Modal onClose={onClose}>
            <div className={styles.container}>
                <ul className={styles.tabs}>
                    {settingsTabs.map((tab) => (
                        <li
                            key={tab.label}
                            className={`${styles.tabElement} ${
                                activeTab === tab.label
                                    ? styles.active
                                    : ""
                            }`}
                            onClick={() => handleTabClick(tab.label)}
                        >
                            {tab.label}
                        </li>
                    ))}
                </ul>
                {activeTab === "Edit Profile" ? (
                    <EditProfile onSave={onSaveEditProfile} currentDisplayName={currentDisplayName} currentBio={currentBio} currentProfilePicture={currentProfilePicture} isLoading={isLoading} />
                ) : activeTab === "Change Email" ? (
                    <ChangeEmail currentEmail={currentEmail} />
                ) : activeTab === "Change Password" ? (
                    <ChangePassword  onSave={onSaveChangePassword} isLoading={isLoading}/>
                ) : (
                    <></>
                )}
            </div>
        </Modal>
    );
}
