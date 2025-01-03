import Editor from "../Editor/Editor.tsx";
import Popup from "../../Popup/Popup.tsx"

export default function ReplyPopUp({parent_comment_id, hideReplyPopUp}: {parent_comment_id: number, hideReplyPopUp: () => void}) {

    return (
        <Popup hidePopUp={hideReplyPopUp}>
            <Editor type={"reply"} parent_id={parent_comment_id} handleSubmit={hideReplyPopUp}/>
        </Popup>
    )
}
