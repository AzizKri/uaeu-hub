import styles from "./Editor.module.scss";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import {$getRoot} from "lexical";
import React, {useEffect, useRef, useState} from "react";
import {createPost} from "../../api.ts";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";

const initialConfig = {
    namespace: 'MyEditor',
    theme: {},
    onError: (error: Error) => {
        console.error(error);
    },
};
export default function Editor({type}: {type: string}): JSX.Element {
    const [plainText, setPlainText] = useState<string>("");
    // const [imageURL, setImageURL] = useState<string | null>(null);
    const [filePreview, setFilePreview] = useState<string | ArrayBuffer | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);


    const EditorHelper = () => {
        const [editor] = useLexicalComposerContext();

        useEffect(() => {
            // Get plain text when editor updates
            const updatePlainText = () => {
                editor.update(() => {
                    const root = $getRoot();
                    const textContent = root.getTextContent(); // Get plain text from editor
                    setPlainText(textContent);
                });
            };

            // Call this function to get the plain text on editor state change
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => updatePlainText());
            });
        }, [editor]);

        return null;
    }

    useEffect(() => {
        if (file || plainText) {
            editorContainerRef.current?.classList.add(styles.focused);
        } else{
            editorContainerRef.current?.classList.remove(styles.focused);
        }
    }, [file, plainText]);

    async function submitPost() {
        // TODO: not sure where the user will come from yet
        if (type === "post") {
            const author: string = "hussain";
            const response = await createPost(author, plainText, file);
            console.log(response);
        } else if (type === "comment") {
            console.log("should send a comment - not implemented yet");
        }
    }

    function uploadImage(event: React.FormEvent) {
        event.preventDefault();
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === "string") {
                    setFilePreview(e.target.result);
                }
            }
            reader.readAsDataURL(file);
            setFile(file);
        }
    }

    return (
        <div
            ref={editorContainerRef}
            className={styles.editorContainer}
        >
            <LexicalComposer initialConfig={initialConfig}>
                <div className={styles.editorInner}>
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className={styles.editorInput}/>
                        }
                        placeholder={
                            <div className={styles.editorPlaceholder}>{
                                type === "post" ? "Write you Question..." :
                                type === "comment" ? "Write your comment..." :
                                ""
                            }
                            </div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <EditorHelper />
                <HistoryPlugin/>
            </LexicalComposer>
            {filePreview &&
                <div className={styles.imagePreview}>
                    <img src={typeof filePreview === 'string' ? filePreview : undefined} alt="uploaded image preview"/>
                    <div className={styles.changeImage} onClick={() => imageInputRef.current?.click()}>change</div>
                    <div className={styles.cancelImage} onClick={() => {
                        setFilePreview(null);
                    }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                        >
                            <path
                                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                        </svg>
                    </div>
                </div>
            }
            <div className={styles.buttons}>
                <div className={styles.buttonIcon} onClick={() => imageInputRef.current?.click()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                         fill="currentColor">
                        <path
                            d="M480-480ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-320h80v320q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/>
                    </svg>
                </div>
                <input ref={imageInputRef} className={styles.postImageInput} type="file" accept="image/*"
                       onChange={uploadImage}/>
                <div className={styles.buttonIcon} onClick={submitPost}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                         fill="currentColor">
                        <path
                            d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}