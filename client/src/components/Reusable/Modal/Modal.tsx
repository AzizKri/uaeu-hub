import styles from './Modal.module.scss';
import {createPortal} from 'react-dom';
import {ReactNode, useEffect, useRef} from "react";
import xIcon from '../../../assets/x.svg';

interface ModalProps {
    onClose: () => void;
    children: ReactNode;
}
export default function Modal({onClose, children}: ModalProps) {

    const modalRef = useRef<HTMLDialogElement>(null);
     useEffect(() => {
         modalRef.current?.showModal();
     }, []);

     const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
         if (e.key === 'Escape') {
             onClose!();
         }
     }

    return createPortal(
        <dialog className={styles.modal} ref={modalRef} onKeyDown={handleKeyDown}>
            <span className={styles.cancel} onClick={() => onClose()}>
                {/*cancel icon*/}
                <img src={xIcon} alt="exit modal" />
            </span>
                {children}
        </dialog>
        , document.body
    )
}
