import styles from "./ReportPopUp.module.scss";
import Modal from "../Modal/Modal.tsx";
import React, { useState } from "react";
import { reportPost, reportComment, reportSubcomment, reportCommunity } from "../../../api/report.ts";
import ThreeDotsLine from "../Animations/ThreeDotsLine/ThreeDotsLine.tsx";

interface ReportPopUpProps {
    entityType: "post" | "comment" | "subcomment" | "community";
    entityId: number;
    hidePopUp: () => void;
}

const REPORT_TYPES = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment or Bullying" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "misinformation", label: "Misinformation" },
    { value: "other", label: "Other" },
];

export default function ReportPopUp({ entityType, entityId, hidePopUp }: ReportPopUpProps) {
    const [reportType, setReportType] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit: React.MouseEventHandler = async (e) => {
        e.stopPropagation();

        if (!reportType) {
            setError("Please select a report type");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            let status: number;

            switch (entityType) {
                case "post":
                    status = await reportPost(entityId, reportType, reason);
                    break;
                case "comment":
                    status = await reportComment(entityId, reportType, reason);
                    break;
                case "subcomment":
                    status = await reportSubcomment(entityId, reportType, reason);
                    break;
                case "community":
                    status = await reportCommunity(entityId, reportType, reason);
                    break;
                default:
                    throw new Error("Invalid entity type");
            }

            if (status === 200) {
                setSuccess(true);
                setTimeout(() => {
                    hidePopUp();
                }, 1500);
            } else if (status === 401) {
                setError("You must be logged in to report");
            } else {
                setError("Failed to submit report. Please try again.");
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        hidePopUp();
    };

    const getEntityLabel = () => {
        switch (entityType) {
            case "post":
                return "post";
            case "comment":
                return "comment";
            case "subcomment":
                return "reply";
            case "community":
                return "community";
            default:
                return "content";
        }
    };

    return (
        <Modal onClose={hidePopUp}>
            <div className={styles.popupContainer}>
                {success ? (
                    <div className={styles.successMessage}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="48px"
                            height="48px"
                            fill="#4CAF50"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <h3>Report Submitted</h3>
                        <p>Thank you for helping keep our community safe.</p>
                    </div>
                ) : (
                    <>
                        <h3>Report {getEntityLabel()}</h3>
                        <p className={styles.description}>
                            Why are you reporting this {getEntityLabel()}?
                        </p>

                        <div className={styles.formGroup}>
                            <select
                                className={styles.select}
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="">Select a reason</option>
                                {REPORT_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Additional details (optional)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                maxLength={1024}
                                rows={4}
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.popupButtons}>
                            <button
                                onClick={handleCancel}
                                className={styles.popupCancelBtn}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={styles.popupSubmitBtn}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ThreeDotsLine /> : "Submit Report"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
