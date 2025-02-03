import ImageUploader from "../../Reusable/ImageUploader/ImageUploader.tsx";
import {useState} from "react";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";

interface EditProfileProps {
    onClose: () => void;
    currentProfilePicture?: string;
    currentDisplayName: string;
    currentBio: string;
    onSave: (updatedDisplayName: string, updatedBio: string, updatedPfp: string) => void;
    isLoading: boolean;
}

export default function EditProfile(
    {
        onClose,
        currentProfilePicture,
        currentDisplayName,
        currentBio,
        onSave,
        isLoading,
    }: EditProfileProps
) {

    const [displayName, setDisplayName] = useState(currentDisplayName);
    const [bio, setBio] = useState(currentBio);
    const [uploadState, setUploadState] = useState<UploadState>({
            status: "IDLE",
            file: null,
            preview: currentProfilePicture,
            fileName: currentProfilePicture
        }
    );
    const handleSave = () => {
        onSave(displayName, bio, (uploadState?.fileName ? uploadState.fileName : ''));
        onClose();
    };
    return (
        <>
            <FormsContainer onSubmit={handleSave} buttonText={"Save"} isLoading={uploadState.status === "UPLOADING" || isLoading} loadingButtonText={"Processing..."}>
                <ImageUploader uploadState={uploadState} setUploadState={setUploadState} type="PROFILE"/>
                <FormItem type={"text"} id={"displayName"} label={"Display Name"} value={displayName} onChange={(e) => setDisplayName(e.target.value)}></FormItem>
                <FormItem type={"area"} id={"bio"} label={"Bio"} value={bio} onChange={(e) => setBio(e.target.value)}/>
            </FormsContainer>
        </>
    )
}
