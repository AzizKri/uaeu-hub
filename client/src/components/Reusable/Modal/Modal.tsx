import styles from "./Modal.module.scss";
import { createPortal } from "react-dom";
import React, { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
    onClose: () => void;
    children: ReactNode;
    z_index?: number;
}

export default function Modal({ onClose, children, z_index = 1 }: ModalProps) {
    const modalRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        modalRef.current?.showModal();
    }, []);

    const customStyle = {
        zIndex: z_index,
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    const handleXClick: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        onClose();
    }

    return createPortal(
        <dialog
            className={styles.modal}
            ref={modalRef}
            onKeyDown={handleKeyDown}
            style={customStyle}
        >
            <span className={styles.cancel} onClick={handleXClick} style={customStyle}>
                {/*cancel icon*/}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                >
                    <path
                        d="M 18.569 5.419 L 5.556 18.457 M 5.432 5.468 L 18.495 18.581"
                        style={{
                            stroke: "rgb(0, 0, 0)",
                            strokeWidth: "2px",
                            strokeLinecap: "round",
                            fill: "none",
                        }}
                    />
                </svg>
            </span>
            {children}
        </dialog>,
        document.body,
    );
}
