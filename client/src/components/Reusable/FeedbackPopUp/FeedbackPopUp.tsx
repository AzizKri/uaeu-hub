import styles from "./FeedbackPopUp.module.scss";
import Modal from "../Modal/Modal.tsx";
import React, { useState, useRef } from "react";
import { submitBugReport, submitFeatureRequest } from "../../../api/feedback.ts";
import { uploadAttachment } from "../../../api/attachmets.ts";
import ThreeDotsLine from "../Animations/ThreeDotsLine/ThreeDotsLine.tsx";
import { assetsBase } from "../../../api/api.ts";

interface FeedbackPopUpProps {
    type: "bug" | "feature";
    hidePopUp: () => void;
}

export default function FeedbackPopUp({ type, hidePopUp }: FeedbackPopUpProps) {
    const [description, setDescription] = useState<string>("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit: React.MouseEventHandler = async (e) => {
        e.stopPropagation();

        if (!description.trim()) {
            setError("Please provide a description");
            return;
        }

        if (description.trim().length < 10) {
            setError("Description must be at least 10 characters long");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            let status: number;

            if (type === "bug") {
                status = await submitBugReport(description, screenshot || undefined);
            } else {
                status = await submitFeatureRequest(description, screenshot || undefined);
            }

            if (status === 201) {
                setSuccess(true);
                setTimeout(() => {
                    hidePopUp();
                }, 1500);
            } else if (status === 401) {
                setError("You must be logged in to submit feedback");
            } else {
                setError("Failed to submit. Please try again.");
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setScreenshotPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload file
            const result = await uploadAttachment([file]);
            if (result.status === 201 && result.filename) {
                setScreenshot(result.filename);
            } else {
                setError("Failed to upload screenshot. Please try again.");
                setScreenshotPreview(null);
            }
        } catch {
            setError("Failed to upload screenshot. Please try again.");
            setScreenshotPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveScreenshot = () => {
        setScreenshot(null);
        setScreenshotPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getTitle = () => {
        return type === "bug" ? "Report a Bug" : "Request a Feature";
    };

    const getDescription = () => {
        return type === "bug"
            ? "Describe the bug you encountered. Include steps to reproduce if possible."
            : "Describe the feature you'd like to see. Be as detailed as possible.";
    };

    const getPlaceholder = () => {
        return type === "bug"
            ? "Describe the bug in detail..."
            : "Describe the feature you'd like...";
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
                        <h3>{type === "bug" ? "Bug Report Submitted" : "Feature Request Submitted"}</h3>
                        <p>Thank you for your feedback!</p>
                    </div>
                ) : (
                    <>
                        <h3>{getTitle()}</h3>
                        <p className={styles.description}>{getDescription()}</p>

                        <div className={styles.formGroup}>
                            <textarea
                                className={styles.textarea}
                                placeholder={getPlaceholder()}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={2048}
                                rows={5}
                            />
                            <span className={styles.charCount}>{description.length}/2048</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.screenshotLabel}>
                                Screenshot (optional)
                            </label>
                            
                            {screenshotPreview ? (
                                <div className={styles.screenshotPreview}>
                                    <img src={screenshotPreview} alt="Screenshot preview" />
                                    <button
                                        type="button"
                                        className={styles.removeScreenshot}
                                        onClick={handleRemoveScreenshot}
                                        disabled={isUploading || isSubmitting}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.uploadArea}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleFileSelect}
                                        disabled={isUploading || isSubmitting}
                                        className={styles.fileInput}
                                        id="screenshot-input"
                                    />
                                    <label htmlFor="screenshot-input" className={styles.uploadButton}>
                                        {isUploading ? (
                                            <ThreeDotsLine />
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                                                </svg>
                                                <span>Add Screenshot</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.popupButtons}>
                            <button
                                onClick={handleCancel}
                                className={styles.popupCancelBtn}
                                disabled={isSubmitting || isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={styles.popupSubmitBtn}
                                disabled={isSubmitting || isUploading}
                            >
                                {isSubmitting ? <ThreeDotsLine /> : "Submit"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
