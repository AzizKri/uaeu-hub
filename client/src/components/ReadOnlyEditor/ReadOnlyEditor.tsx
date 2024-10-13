import styles from "../Post/post.module.scss";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {useEffect, useState} from "react";
import {EditorState} from "lexical";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";

export default function ReadOnlyEditor({ editorContent } : {editorContent: string} ) {

    const [edotor] = useLexicalComposerContext();
    useEffect(() => {
        if (editorContent) {
            const parsedEditorContent = EditorState.fromJSON(editorContent);
            EditorState
        }
    })
    const initialConfig = {
        editorState: null, // You set the editorState later from JSON
        editable: false, // Make it read-only for displaying the post
        onError(error) {
            console.error(error);
        },
    };

    return (
        <div className={styles.post__content}>
            <LexicalComposer initialConfig={initialConfig}>
                {/* The JSON string should be parsed back into an object */}
                <ContentEditable className={styles.post__content__content}/>
                <ReadOnlyEditor initialEditorState={JSON.parse(storedEditorStateJSON)} />
            </LexicalComposer>
            {showContent ? content : <> {content.slice(0, 200)} <span>&#8230;</span> </>}
            {showContent ? "" :
                <span className={styles.show_more} onClick={() => setShowContent(true)}>show more</span>}
        </div>

    )
}