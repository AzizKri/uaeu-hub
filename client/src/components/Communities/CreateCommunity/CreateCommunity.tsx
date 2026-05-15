import styles from "./CreateCommunity.module.scss";
import Modal from "../../Reusable/Modal/Modal.tsx";
import React, {
    ChangeEventHandler,
    KeyboardEventHandler,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    communityExists,
    createCommunity,
    editCommunity,
} from "../../../api/communities.ts";
import { getTags } from "../../../api/tags.ts";
import xIcon from "../../../assets/x-14-white.svg";
import plusIcon from "../../../assets/plus.svg";
import { useNavigate } from "react-router-dom";
import ThreeDotsLine from "../../Reusable/Animations/ThreeDotsLine/ThreeDotsLine.tsx";
import {
    dataURLtoFile,
    debounce,
    getDefaultIconForCommunity,
    isAssetId,
} from "../../../utils/tools.ts";
import ImageUploader, {
    ImageUploaderMethods,
} from "../../Reusable/ImageUploader/ImageUploader.tsx";
import { uploadIcon } from "../../../api/attachmets.ts";
import {
    getCommunityDescriptionError,
    getCommunityNameError,
} from "./communityFormValidation.ts";

interface props {
    type: "CREATE" | "EDIT";
    onClose: () => void;
    icon?: string;
    name?: string;
    description?: string;
    tags?: string;
    id?: number;
}

export default function CreateCommunity({
    type,
    onClose,
    icon,
    name,
    description,
    tags,
    id,
}: props) {
    const [nameState, setNameState] = useState<string>(
        name !== undefined ? name : "",
    );
    const [descriptionState, setDescriptionState] = useState<string>(
        description !== undefined ? description : "",
    );
    const [nameError, setNameError] = useState<boolean>(false);
    const [descriptionError, setDescriptionError] = useState<boolean>(false);
    const [uploadState, setUploadState] = useState<UploadState>(
        icon !== undefined
            ? {
                  status: "IDLE",
                  file: null,
                  preview: icon,
                  fileName: isAssetId(icon) ? icon : undefined,
              }
            : {
                  status: "IDLE",
                  file: null,
                  preview: null,
              },
    );
    const [selectedTags, setSelectedTags] = useState<
        { id: number; name: string }[]
    >([]);
    const [unSelectedTags, setUnSelectedTags] = useState<
        { id: number; name: string }[]
    >([]);
    const [currentTag, setCurrentTag] = useState<string>("");
    const [userTagsCounter, setUserTagsCounter] = useState<number>(-1);
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [nameExist, setNameExist] = useState<boolean>(true);
    const [checkingName, setCheckingName] = useState<boolean>(false);
    const [nameFocus, setNameFocus] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const childRef = useRef<ImageUploaderMethods>(null);
    const checkName = useRef(
        debounce(async (communityName: string) => {
            communityExists(communityName).then((res) => {
                setNameExist(res);
                setCheckingName(false);
            });
        }, 1000),
    ).current;
    const currentNameErrorMessage = getCommunityNameError(nameState);

    useEffect(() => {
        getTags().then((res) => {
            if (tags) {
                setSelectedTags(
                    res.data.filter((tag: { name: string }) =>
                        tags.includes(tag.name),
                    ),
                );
                setUnSelectedTags(
                    res.data.filter(
                        (tag: { name: string }) => !tags.includes(tag.name),
                    ),
                );
            } else {
                setUnSelectedTags(res.data);
            }
        });
        if (!icon) {
            setUploadState((prev) => ({
                ...prev,
                preview: getDefaultIconForCommunity("", false),
            }));
        }
    }, [icon, tags]);

    const handleFormSubmit: React.FormEventHandler = (e) => {
        e.preventDefault();
    };

    const prepareCommunityIcon = async (communityName: string) => {
        if (uploadState.status === "UPLOADING") {
            setErrorMessage("Please wait for the image upload to finish");
            return null;
        }

        if (uploadState.status === "ERROR") {
            setErrorMessage("Please choose another community icon");
            return null;
        }

        if (isAssetId(uploadState.fileName)) {
            return uploadState.fileName;
        }

        if (typeof uploadState.preview !== "string") {
            return undefined;
        }

        if (!uploadState.preview.startsWith("data")) {
            return isAssetId(uploadState.preview)
                ? uploadState.preview
                : undefined;
        }

        const file =
            uploadState.file ??
            dataURLtoFile(uploadState.preview, `${communityName}.png`);

        if (file === null) {
            setErrorMessage("Could not prepare the community icon");
            return null;
        }

        const response = await uploadIcon(file, "icon");

        if (response.status !== 201 || !response.filename) {
            setUploadState({
                status: "ERROR",
                file: null,
                preview: null,
            });
            setErrorMessage("Could not upload the community icon");
            return null;
        }

        return response.filename;
    };

    const handleCreate = async () => {
        const trimmedName = nameState.trim();
        const trimmedDescription = descriptionState.trim();
        const nameValidationMessage = getCommunityNameError(trimmedName);
        const descriptionValidationMessage =
            getCommunityDescriptionError(descriptionState);

        setErrorMessage("");
        setNameError(!!nameValidationMessage);
        setDescriptionError(!!descriptionValidationMessage);

        if (nameValidationMessage || descriptionValidationMessage) {
            setErrorMessage(
                nameValidationMessage || descriptionValidationMessage,
            );
            return;
        }

        if (type === "CREATE" && checkingName) {
            setNameFocus(true);
            setErrorMessage("Please wait while we check the community name");
            return;
        }

        if (type === "CREATE" && nameExist) {
            setNameError(true);
            setNameFocus(true);
            setErrorMessage("Community name already taken");
            return;
        }

        setIsCreating(true);

        try {
            const iconFileName = await prepareCommunityIcon(trimmedName);

            if (iconFileName === null) {
                return;
            }

            if (type === "CREATE") {
                const result = await createCommunity(
                    trimmedName,
                    trimmedDescription,
                    selectedTags.map((tag) => tag.name),
                    iconFileName,
                );

                if (result.status === 201) {
                    onClose();
                    navigate(`/community/${trimmedName}`);
                } else {
                    setErrorMessage(result.message || "Something went wrong");
                }
            } else if (type === "EDIT" && id !== undefined) {
                const result = await editCommunity(
                    id,
                    trimmedName,
                    trimmedDescription,
                    iconFileName,
                    selectedTags.map((tag) => tag.name),
                );

                if (result.status === 200) {
                    onClose();
                    navigate(`/community/${trimmedName}`);
                } else {
                    setErrorMessage(result.message || "Something went wrong");
                }
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        if (childRef.current) {
            childRef.current.removeImage();
        }
        onClose();
    };

    const removeTag = (tag: { id: number; name: string }) => {
        setSelectedTags((prev) => prev.filter((t) => t.id != tag.id));
        setUnSelectedTags((prev) => [...prev, tag]);
    };

    const addTag = (tag: { id: number; name: string }) => {
        setUnSelectedTags((prev) => prev.filter((t) => t.id != tag.id));
        setSelectedTags((prev) => [...prev, tag]);
    };

    const handleTagChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const val: string = e.target.value;
        if (val.trim() !== "" && val.endsWith(" ")) {
            setSelectedTags((prev) => [
                ...prev,
                { id: userTagsCounter, name: val.trim() },
            ]);
            setCurrentTag("");
            setUserTagsCounter((prev) => prev - 1);
        } else {
            setCurrentTag(val);
        }
    };

    const handleNameInput: ChangeEventHandler<HTMLInputElement> = (e) => {
        setNameError(false);
        setErrorMessage("");
        const nextName = e.target.value;
        setNameState(nextName);
        if (uploadState.status !== "COMPLETED")
            setUploadState((prev) => ({
                ...prev,
                preview: getDefaultIconForCommunity(nextName, false),
            }));
        const validationMessage = getCommunityNameError(nextName);

        if (validationMessage) {
            setCheckingName(false);
            setNameExist(false);
        } else {
            setCheckingName(true);
            checkName(nextName.trim());
        }
    };

    const handleKeyDownOnTags: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            const val = e.currentTarget.value;
            if (val.trim() !== "") {
                setSelectedTags((prev) => [
                    ...prev,
                    { id: userTagsCounter, name: val.trim() },
                ]);
                setCurrentTag("");
                setUserTagsCounter((prev) => prev - 1);
            }
        } else if (e.key === "Backspace" && currentTag === "") {
            const prev = selectedTags;
            const last = selectedTags.pop();
            if (last) {
                setSelectedTags(prev);
                setCurrentTag(last.name);
            }
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.loaderWrapper}>
                    <ImageUploader
                        type="COMMUNITY"
                        setUploadState={setUploadState}
                        uploadState={uploadState}
                        communityName={nameState}
                        ref={childRef}
                    />
                </div>
                {errorMessage && (
                    <div className={styles.errorMessage}>{errorMessage}</div>
                )}
                <form className={styles.form} onSubmit={handleFormSubmit}>
                    <label
                        htmlFor="name-input"
                        className={styles.label}
                        style={nameError ? { border: "2px solid #f33" } : {}}
                    >
                        <div style={nameError ? { color: "#FF3333" } : {}}>
                            Name *
                        </div>
                        <input
                            id="name-input"
                            type="text"
                            onChange={handleNameInput}
                            value={nameState}
                            className={styles.nameInput}
                            onFocus={() => setNameFocus(true)}
                            onBlur={() => setNameFocus(false)}
                        />
                        {nameFocus && nameState !== "" && (
                            <span className={styles.nameTooltip}>
                                {currentNameErrorMessage ? (
                                    currentNameErrorMessage
                                ) : checkingName ? (
                                    <ThreeDotsLine />
                                ) : nameExist ? (
                                    "Not Available"
                                ) : (
                                    "Available"
                                )}
                            </span>
                        )}
                    </label>
                    <label
                        htmlFor="description-input"
                        className={styles.label}
                        style={
                            descriptionError ? { border: "2px solid #f33" } : {}
                        }
                    >
                        <div
                            style={descriptionError ? { color: "#FF3333" } : {}}
                        >
                            Description *
                        </div>
                        <textarea
                            value={descriptionState}
                            className={styles.description}
                            onChange={(e) => {
                                setDescriptionError(false);
                                setDescriptionState(e.target.value);
                            }}
                        >
                            {descriptionState}
                        </textarea>
                    </label>
                    <label className={styles.label}>
                        <div>Tags</div>
                        <ul className={styles.tagList}>
                            {selectedTags.map(
                                (tag: { id: number; name: string }) => (
                                    <li
                                        key={tag.id}
                                        className={styles.selectedTag}
                                        onClick={() => removeTag(tag)}
                                    >
                                        {tag.name}
                                        <img
                                            src={xIcon}
                                            alt="unselect this tag"
                                        />
                                    </li>
                                ),
                            )}
                            <input
                                type="text"
                                value={currentTag}
                                onChange={handleTagChange}
                                className={styles.tagInput}
                                onKeyDown={handleKeyDownOnTags}
                            />
                        </ul>
                        <hr />
                        <ul className={styles.tagList}>
                            {unSelectedTags.map(
                                (tag: { id: number; name: string }) => (
                                    <li
                                        key={tag.id}
                                        className={styles.unSelectedTag}
                                        onClick={() => addTag(tag)}
                                    >
                                        {tag.name}
                                        <img
                                            src={plusIcon}
                                            alt="unselect this tag"
                                        />
                                    </li>
                                ),
                            )}
                        </ul>
                    </label>
                </form>
                <div className={styles.actions}>
                    <button className="btn-secondary" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleCreate}
                        disabled={isCreating}
                    >
                        {isCreating ? <ThreeDotsLine /> : "Create"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
