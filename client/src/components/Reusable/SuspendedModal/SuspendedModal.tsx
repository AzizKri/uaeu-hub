import styles from './SuspendedModal.module.scss';
import Modal from '../Modal/Modal.tsx';

interface SuspendedModalProps {
    suspendedUntil: number;
    onClose: () => void;
}

export default function SuspendedModal({ suspendedUntil, onClose }: SuspendedModalProps) {
    const suspendedDate = new Date(suspendedUntil * 1000);
    const formattedDate = suspendedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Modal onClose={onClose}>
            <div className={styles.content}>
                <div className={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                </div>
                <h2 className={styles.title}>Account Suspended</h2>
                <p className={styles.message}>
                    Your account has been temporarily suspended. During this time, you can view content but cannot:
                </p>
                <ul className={styles.restrictions}>
                    <li>Create posts</li>
                    <li>Write comments</li>
                    <li>Like content</li>
                    <li>Create communities</li>
                </ul>
                <p className={styles.until}>
                    Your suspension will be lifted on <strong>{formattedDate}</strong>
                </p>
                <button className={styles.closeBtn} onClick={onClose}>
                    I Understand
                </button>
            </div>
        </Modal>
    );
}
