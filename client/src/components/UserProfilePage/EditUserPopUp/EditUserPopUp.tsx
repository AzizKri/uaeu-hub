import {useState, useMemo} from 'react';
import styles from './EditUserPopUp.module.scss';
import Modal from "../../Reusable/Modal/Modal.tsx";
import EditProfile from "../UserProfileSettings/EditProfile.tsx";
import ChangePassword from "../UserProfileSettings/ChangePassword.tsx";
import ChangeEmail from "../UserProfileSettings/ChangeEmail.tsx";

type tab = "Edit Profile" | "Change Email" | "Change Password"

interface EditUserPopUpProps {
    onClose: () => void;
    currentProfilePicture?: string;
    currentDisplayName: string;
    currentBio: string;
    currentEmail: string;
    onSaveEditProfile: (updatedDisplayName: string, updatedBio: string, updatedPfp?: string) => void;
    onPasswordChangeSuccess: () => void;
    onPasswordChangeError: (message: string) => void;
    isLoading: boolean;
}

export default function EditUserPopUp({
                                          onClose,
                                          currentProfilePicture,
                                          currentDisplayName,
                                          currentBio,
                                          currentEmail,
                                          onSaveEditProfile,
                                          onPasswordChangeSuccess,
                                          onPasswordChangeError,
                                          isLoading,
                                      }: EditUserPopUpProps) {
    const [activeTab, setActiveTab] = useState<tab>("Edit Profile");

    const settingsTabs = useMemo<{ label: tab }[]>(() => {
        return [
            { label: "Edit Profile" },
            { label: "Change Email" },
            { label: "Change Password" },
        ];
    }, []);

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
                    <ChangeEmail currentEmail={currentEmail} onSuccess={onPasswordChangeSuccess} onError={onPasswordChangeError} />
                ) : activeTab === "Change Password" ? (
                    <ChangePassword onSuccess={onPasswordChangeSuccess} onError={onPasswordChangeError} />
                ) : (
                    <></>
                )}
            </div>
        </Modal>
    );
}
