import { useEffect } from 'react';
import { signOut, auth } from '../../../firebase/config';
import styles from './BannedModal.module.scss';

interface BannedModalProps {
    onClose?: () => void;
}

export default function BannedModal({ onClose }: BannedModalProps) {
    useEffect(() => {
        // Auto-logout after showing the modal
        const timer = setTimeout(async () => {
            await signOut(auth);
            if (onClose) onClose();
        }, 5000); // Wait 5 seconds before logging out

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleLogout = async () => {
        await signOut(auth);
        if (onClose) onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.icon}>🚫</div>
                <h2>Account Banned</h2>
                <p>
                    Your account has been permanently banned due to violation of our 
                    community guidelines.
                </p>
                <p className={styles.info}>
                    If you believe this is a mistake, please contact support.
                </p>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    Log Out
                </button>
                <p className={styles.autoLogout}>
                    You will be automatically logged out in 5 seconds...
                </p>
            </div>
        </div>
    );
}
