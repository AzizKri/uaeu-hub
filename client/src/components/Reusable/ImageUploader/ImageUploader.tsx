import styles from "./ImageUploader.module.scss";
import communityIcon from "../../../assets/community-icon.jpg";
import editImage from "../../../assets/image-edit-outline.svg";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { deleteAttachment, uploadIcon } from "../../../api/attachmets.ts";
import DotsSpinner from "../Animations/DotsSpinner/DotsSpinner.tsx";

interface ImageUploaderProps {
    type: "COMMUNITY" | "PROFILE";
    uploadState: UploadState;
    setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;
}

export interface ImageUploaderMethods {
    removeImage: () => void;
}

export default forwardRef<ImageUploaderMethods, ImageUploaderProps>(
    function ImageUploader({ type, uploadState, setUploadState }, ref) {
        const imageInputRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => {
            return {
                removeImage: removeImage,
            };
        });

        const handleChangeImage = () => {
            if (typeof uploadState.fileName === "string")
                deleteAttachment(uploadState.fileName).then(() =>
                    console.log("attachment deleted"),
                );
            imageInputRef.current?.click();
        };

        const handleFileUpload = async (
            event: React.ChangeEvent<HTMLInputElement>,
        ) => {
            const selectedFile = event.target.files?.[0];
            if (!selectedFile) return;

            try {
                setUploadState({
                    status: "UPLOADING",
                    file: selectedFile,
                    preview: null,
                });

                // Create preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadState((prev) => ({
                        ...prev,
                        preview: e.target?.result || null,
                    }));
                };
                reader.readAsDataURL(selectedFile);

                const response = await uploadIcon(
                    [selectedFile],
                    type === "PROFILE" ? "pfp" : "icon",
                );

                if (response.status === 201) {
                    setUploadState((prev) => ({
                        ...prev,
                        status: "COMPLETED",
                        fileName: response.filename,
                    }));
                } else {
                    console.error(
                        `Upload failed with status: ${response.status}`,
                    );
                    setUploadState({
                        status: "ERROR",
                        file: null,
                        preview: null,
                    });
                }
            } catch (error) {
                console.error("File upload error:", error);
                setUploadState({
                    status: "ERROR",
                    file: null,
                    preview: null,
                });
            }
        };

        const removeImage = () => {
            if (typeof uploadState.fileName === "string")
                deleteAttachment(uploadState.fileName).then(() =>
                    console.log("attachment deleted"),
                );
            setUploadState({
                status: "IDLE",
                file: null,
                preview: null,
            });
            if (imageInputRef.current) {
                imageInputRef.current.value = "";
            }
        };

        return (
            <div
                className={styles.imagePreview}
                style={{ width: type === "COMMUNITY" ? "150px" : "100px" }}
            >
                {uploadState.status === "UPLOADING" ? (
                    <DotsSpinner />
                ) : (
                    <img
                        src={
                            uploadState.status === "COMPLETED" &&
                            typeof uploadState.preview === "string"
                                ? uploadState.preview
                                : uploadState.status === "IDLE" &&
                                    typeof uploadState.preview === "string"
                                  ? uploadState.preview
                                  : communityIcon
                        }
                        alt="uploaded image preview"
                    />
                )}
                <div className={styles.changeImage} onClick={handleChangeImage}>
                    <img src={editImage} alt="edit image" />
                </div>
                {uploadState.status === "COMPLETED" && (
                    <div className={styles.cancelImage} onClick={removeImage}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                        >
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                    </div>
                )}
                <input
                    id="image-upload"
                    ref={imageInputRef}
                    className={styles.imageInput}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    hidden
                />
            </div>
        );
    },
);
