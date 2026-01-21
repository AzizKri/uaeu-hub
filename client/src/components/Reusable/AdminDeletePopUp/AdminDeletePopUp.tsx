import styles from "./AdminDeletePopUp.module.scss";
import Modal from "../Modal/Modal.tsx";
import React, { useState } from "react";

interface AdminDeletePopUpProps {
    type: "POST" | "COMMENT" | "SUB-COMMENT";
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    hidePopUp: () => void;
}

export default function AdminDeletePopUp({
    type,
    onConfirm,
    onCancel,
    hidePopUp
}: AdminDeletePopUpProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleConfirm: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        
        if (!reason.trim()) {
            setError("Please provide a reason for deletion");
            return;
        }
        
        hidePopUp();
        onConfirm(reason.trim());
    };

    const handleCancel: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        hidePopUp();
        onCancel();
    };

    const getEntityName = () => {
        switch (type) {
            case "POST":
                return "post";
            case "COMMENT":
                return "comment";
            case "SUB-COMMENT":
                return "reply";
            default:
                return "content";
        }
    };

    return (
        <Modal onClose={hidePopUp}>
            <div className={styles.popupContainer}>
                <h3>Delete {getEntityName()}</h3>
                <p>You are about to delete another user's {getEntityName()}. Please provide a reason:</p>
                
                <textarea
                    className={styles.reasonInput}
                    placeholder="Enter reason for deletion..."
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        setError("");
                    }}
                    rows={3}
                    onClick={(e) => e.stopPropagation()}
                />
                
                {error && <p className={styles.errorText}>{error}</p>}
                
                <div className={styles.popupButtons}>
                    <button onClick={handleCancel} className={styles.popupCancelBtn}>
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className={styles.popupDeleteBtn}>
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
}
