import styles from "../WritePost/WritePost.module.scss";

// import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
import React, {useState, useRef} from "react";
import {EditorState} from "lexical";
import {createPost} from '../../api.ts';

const theme = {
    // Theme styling goes here
    //...
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
    console.error(error);
}


export default function WritePost() {
    const [editorState, setEditorState] = useState<EditorState | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
    };

    async function submitPost() {
        // console.log(JSON.stringify(editorState?.toJSON()));
        const content: string = JSON.stringify(editorState?.toJSON());
        const author: string = "HussianElemam";
        const response = await createPost(author, content);
        console.log(response);

    }

    function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        const file = event.target.files![0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            // TODO fitch data to actual database and take the url
            const newImageURL = URL.createObjectURL(file);
            setImageURL(newImageURL)
        }
    }

    return (
        <div className={styles.newPost}>
            <div className={styles.editorContainer}>
                <LexicalComposer initialConfig={initialConfig}>
                    <div className={styles.editorInner}>
                        <RichTextPlugin
                            contentEditable={<ContentEditable className={styles.editorInput}/>}
                            placeholder={<div className={styles.editorPlaceholder}>Write a question...</div>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                    </div>
                    <HistoryPlugin />
                    <OnChangePlugin onChange={(editorState: EditorState) => setEditorState(editorState)} />
                    {/*<AutoFocusPlugin />*/}
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
                    <input ref={imageInputRef} className={styles.postImageInput} type="file" accept="image/*" onChange={uploadImage}/>
                    <div className={styles.buttonIcon} onClick={submitPost}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                             fill="currentColor">
                            <path
                                d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}