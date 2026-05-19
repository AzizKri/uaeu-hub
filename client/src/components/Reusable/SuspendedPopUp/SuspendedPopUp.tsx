import styles from './SuspendedPopUp.module.scss';
import Modal from '../Modal/Modal.tsx';
import { useUser } from '../../../contexts/user/UserContext.ts';

interface SuspendedPopUpProps {
    hidePopUp: () => void;
}

export default function SuspendedPopUp({ hidePopUp }: SuspendedPopUpProps) {
    const { user } = useUser();
    
    const getFormattedDate = () => {
        if (!user?.suspendedUntil) return 'Unknown';
        const date = new Date(user.suspendedUntil * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal onClose={hidePopUp}>
            <div className={styles.content}>
                <div className={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                </div>
                <p className={styles.message}>
                    Your account is suspended. You cannot perform this action until <strong>{getFormattedDate()}</strong>.
                </p>
                <button className={styles.okBtn} onClick={hidePopUp}>
                    OK
                </button>
            </div>
        </Modal>
    );
}
