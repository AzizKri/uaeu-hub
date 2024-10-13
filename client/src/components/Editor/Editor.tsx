import styles from "./Editor.module.scss";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
// import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
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
    const [imageURL, setImageURL] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);


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

    async function submitPost() {
        // TODO: not sure where the user will come from
        if (type === "post") {
            const author: string = "HussainElemam";
            const response = await createPost(author, plainText);
            console.log(response);
        } else if (type === "comment") {
            console.log("should send a comment - not implemented yet");
        }
    }

    function uploadImage(event: React.FormEvent) {
        event.preventDefault();
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            // TODO fitch data to actual database and take the url
            const newImageURL = URL.createObjectURL(file);
            setImageURL(newImageURL)
        }
    }

    return (
        <div
            className={styles.editorContainer}
            onFocus={(e) => {e.currentTarget.classList.add(styles.focused)}}
            onBlur={(e) => {if (plainText.length == 0) e.currentTarget.classList.remove(styles.focused)}}
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
            {imageURL &&
                <div className={styles.imagePreview}>
                    <img src={imageURL} alt="uploaded image preview"/>
                    <div className={styles.changeImage} onClick={() => imageInputRef.current?.click()}>change</div>
                    <div className={styles.cancelImage} onClick={() => setImageURL(null)}>
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