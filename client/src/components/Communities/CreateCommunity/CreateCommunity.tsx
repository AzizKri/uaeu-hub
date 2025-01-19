import styles from "./CreateCommunity.module.scss";
import Modal from "../../Reusable/Modal/Modal.tsx";
import React, {
    ChangeEventHandler, KeyboardEventHandler,
    useCallback,
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
import LoaderDots from "../../Reusable/LoaderDots/LoaderDots.tsx";
import { debounce } from "../../../lib/utils/tools.ts";
import ImageUploader, {ImageUploaderMethods} from "../../Reusable/ImageUploader/ImageUploader.tsx";

interface props {
    type: "CREATE" | "EDIT";
    onClose: () => void;
    icon?: string;
    name?: string;
    description?: string;
    tags?: string;
    id?: number
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
    }, [tags]);


    const handleFormSubmit: React.FormEventHandler = (e) => {
        e.preventDefault();
        console.log("image State", uploadState);
        console.log("name", nameState);
        console.log("desc", descriptionState);
    };

    const handleCreate = () => {
        if (nameState === "") {
            setNameError(true);
        }
        if (descriptionState === "") {
            setDescriptionError(true);
        }
        if (nameExist) {
            setNameError(true);
            setNameFocus(true);
        }
        if (descriptionState === "" || nameState === "") return;
        setIsCreating(true);
        if (type === "CREATE") {
            createCommunity(
                nameState,
                descriptionState,
                selectedTags.map((tag) => tag.name),
                uploadState.fileName,
            )
                .then((status) => {
                    if (status === 201) {
                        onClose();
                        navigate(`/community/${nameState}`);
                    } else {
                        setErrorMessage("Something went wrong");
                    }
                })
                .finally(() => {
                    setIsCreating(false);
                });
        } else if (type === "EDIT" && id) {
            editCommunity(
                id,
                nameState,
                descriptionState,
                uploadState.fileName,
                selectedTags.map((tag) => tag.name),
            )
                .then((status) => {
                    if (status === 200) {
                        onClose();
                        navigate(`/community/${nameState}`);
                    } else {
                        setErrorMessage("Something went wrong");
                    }
                })
                .finally(() => setIsCreating(false));
        }
    };

    const checkName = useCallback(
        debounce(async (name: string) => {
            communityExists(name).then((res) => {
                setNameExist(res);
                setCheckingName(false);
            });
        }, 1000),
        [],
    );

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
        setNameState(e.target.value);
        if (e.target.value !== "") {
            setCheckingName(true);
            checkName(e.target.value);
        }
    };

    const handleKeyDownOnTags: KeyboardEventHandler<HTMLInputElement> = (e) => {
        console.log(e.key);
        if (e.key === "Enter" ) {
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
    }

    return (
        <Modal onClose={onClose}>
            <div className={styles.container}>
                <ImageUploader type="COMMUNITY" setUploadState={setUploadState} uploadState={uploadState} ref={childRef}/>
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
                                {checkingName ? (
                                    <LoaderDots />
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
                        style={nameError ? { border: "2px solid #f33" } : {}}
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
                                onSubmit={() => console.log("submit")}
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
                    <button className="btn-primary" onClick={handleCreate}>
                        {isCreating ? <LoaderDots /> : "Create"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
