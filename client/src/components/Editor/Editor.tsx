import styles from "./Editor.module.scss";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { $getRoot } from "lexical";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { comment, createPost, uploadAttachment } from "../../api";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useUpdatePosts } from "../../lib/hooks";
import LoaderDots from "../LoaderDots/LoaderDots";

interface UploadState {
    status: "IDLE" | "UPLOADING" | "COMPLETED" | "ERROR";
    fileName?: string;
    file: File | null;
    preview: string | ArrayBuffer | null;
}

const initialConfig = {
    namespace: "MyEditor",
    theme: {},
    onError: (error: Error) => {
        console.error(error);
    },
};

export default function Editor({
    type,
    parent_id,
    handleSubmit,
}: {
    type: string;
    parent_id: number | null;
    handleSubmit: (() => void) | null;
}): JSX.Element {
    const [plainText, setPlainText] = useState<string>("");
    const [uploadState, setUploadState] = useState<UploadState>({
        status: "IDLE",
        file: null,
        preview: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const editorHelperRef = useRef<{ clearEditorContent: () => void }>(null);
    const {updatePosts} = useUpdatePosts();

    useEffect(() => {
        const hasContent = !!(uploadState.file || plainText);
        editorContainerRef.current?.classList.toggle(
            styles.focused,
            hasContent,
        );
    }, [uploadState.file, plainText]);

    const EditorHelper = forwardRef((_props, ref) => {
        const [editor] = useLexicalComposerContext();

        useEffect(() => {
            const updatePlainText = () => {
                editor.update(() => {
                    const root = $getRoot();
                    setPlainText(root.getTextContent());
                });
            };

            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => updatePlainText());
            });
        }, [editor]);

        useImperativeHandle(ref, () => ({
            clearEditorContent: () => {
                editor.update(() => {
                    $getRoot().clear();
                });
            },
        }));

        return null;
    });

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

            // Upload file
            const response = await uploadAttachment([selectedFile]);

            if (response.status === 201) {
                setUploadState((prev) => ({
                    ...prev,
                    status: "COMPLETED",
                    fileName: response.filename,
                }));
            } else {
                throw new Error(
                    `Upload failed with status: ${response.status}`,
                );
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
        setUploadState({
            status: "IDLE",
            file: null,
            preview: null,
        });
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const submitPost = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Check if we're still uploading a file
            if (uploadState.status === "UPLOADING") {
                throw new Error("Please wait for file upload to complete");
            }

            // Submit the post or comment
            if (type === "post") {
                await createPost(plainText, uploadState.fileName);
            } else if ((type === "comment" || type === "reply") && parent_id) {
                await comment(parent_id, plainText, uploadState.fileName);
                if (type === "reply" && handleSubmit) {
                    handleSubmit();
                }
            }

            // Reset the editor
            if (editorHelperRef.current) {
                editorHelperRef.current.clearEditorContent();
            }
            removeImage();
            updatePosts();
        } catch (error) {
            console.error("Error submitting post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div ref={editorContainerRef} className={styles.editorContainer}>
            <LexicalComposer initialConfig={initialConfig}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className={styles.editorInput} />
                    }
                    placeholder={
                        <div className={styles.editorPlaceholder}>
                            {type === "post"
                                ? "What's your question?"
                                : type === "comment" || type === "reply"
                                  ? "Reply..."
                                  : ""}
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <EditorHelper ref={editorHelperRef} />
                <HistoryPlugin />
            </LexicalComposer>

            {uploadState.preview && (
                <div className={styles.imagePreview}>
                    <img
                        src={
                            typeof uploadState.preview === "string"
                                ? uploadState.preview
                                : undefined
                        }
                        alt="uploaded image preview"
                    />
                    <div
                        className={styles.changeImage}
                        onClick={() => imageInputRef.current?.click()}
                    >
                        change
                    </div>
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
                </div>
            )}

            <div className={styles.buttons}>
                <div
                    className={styles.buttonIcon}
                    onClick={() => imageInputRef.current?.click()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -960 960 960"
                        fill="currentColor"
                    >
                        <path d="M480-480ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-320h80v320q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
                    </svg>
                </div>
                <input
                    ref={imageInputRef}
                    className={styles.postImageInput}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                />
                <div className={styles.buttonIcon} onClick={submitPost}>
                    {isSubmitting || uploadState.status === "UPLOADING" ? (
                        <LoaderDots />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                        >
                            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}
