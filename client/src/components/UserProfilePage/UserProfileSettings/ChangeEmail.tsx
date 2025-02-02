import {useState} from "react";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";

// interface EditEmailProps {
//     onClose: () => void;
//     currentProfilePicture?: string;
//     currentDisplayName: string;
//     currentBio: string;
//     onSave: (updatedDisplayName: string, updatedBio: string, updatedPfp: string) => void;
// }

export default function ChangeEmail(
    {
        currentEmail
    }: {currentEmail: string}
) {

    const [newEmail, setNewEmail] = useState("");
    const handleSave = () => {
        return;
    };
    return (
        <>
            <FormsContainer onSubmit={handleSave} buttonText={"Save"}>
                <FormItem type={"text"} id={"currentEmail"} label={"Current Email"} value={currentEmail} disabled={true}></FormItem>
                <FormItem type={"text"} id={"newEmail"} label={"New Email"} value={newEmail} onChange={(e) => setNewEmail(e.target.value)}/>
            </FormsContainer>
        </>
    )
}
