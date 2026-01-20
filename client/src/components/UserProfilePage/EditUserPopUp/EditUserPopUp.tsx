import {useState, useMemo} from 'react';
import styles from './EditUserPopUp.module.scss';
import Modal from "../../Reusable/Modal/Modal.tsx";
import EditProfile from "../UserProfileSettings/EditProfile.tsx";
import ChangePassword from "../UserProfileSettings/ChangePassword.tsx";
import ChangeEmail from "../UserProfileSettings/ChangeEmail.tsx";
import { auth } from "../../../firebase/config";

type tab = "Edit Profile" | "Change Email" | "Change Password"

interface EditUserPopUpProps {
    onClose: () => void;
    currentProfilePicture?: string;
    currentDisplayName: string;
    currentBio: string;
    currentEmail: string;
    onSaveEditProfile: (updatedDisplayName: string, updatedBio: string, updatedPfp: string) => void;
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

    // Check if user has a password provider (email/password auth)
    // Google-only users won't have a password provider
    const hasPasswordProvider = useMemo(() => {
        const user = auth.currentUser;
        if (!user) return false;
        return user.providerData.some(provider => provider.providerId === 'password');
    }, []);

    // Build tabs list based on whether user has password auth
    const settingsTabs = useMemo(() => {
        const tabs: { label: tab }[] = [
            { label: "Edit Profile" },
            // { label: "Change Email" },
        ];
        
        // Only show Change Password for users with password auth
        if (hasPasswordProvider) {
            tabs.push({ label: "Change Password" });
        }
        
        return tabs;
    }, [hasPasswordProvider]);

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
                    <ChangePassword onSuccess={onPasswordChangeSuccess} onError={onPasswordChangeError} />
                ) : (
                    <></>
                )}
            </div>
        </Modal>
    );
}
