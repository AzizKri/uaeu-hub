import styles from "./OptionsMenu.module.scss";
import React, { useState } from "react";
import { useUpdatePosts, useUser } from "../../../lib/utils/hooks.ts";
import YesNoPopUp from "../../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import { deleteComment as apiDeleteComment } from "../../../api/comments.ts";
import { deletePost as apiDeletePost } from "../../../api/posts.ts";

interface OptionsMenuProps {
    type: "POST" | "COMMENT";
    id: number;
    author: string;
    deleteComment?: (commentId: number) => void;
}

export default function OptionsMenu({
    type,
    id,
    author,
    deleteComment,
}: OptionsMenuProps) {
    const [optionsDisplayed, setOptionsDisplayed] = useState<boolean>(false);
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const { deletePost } = useUpdatePosts();
    const { user } = useUser();

    const handleClickOptions: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        setOptionsDisplayed(true);
        const listener = () => {
            setOptionsDisplayed(false);
            document.removeEventListener("click", listener);
        };
        document.addEventListener("click", listener);
    };

    const handleDeletePost = async () => {
        if (type === "POST") {
            deletePost(id);
            await apiDeletePost(id);
        } else if (deleteComment) {
            deleteComment(id);
            await apiDeleteComment(id);
        }
    };

    return (
        <div className={styles.container} onClick={handleClickOptions}>
            {optionsDisplayed && (
                <ul className={styles.options_menu}>
                    {showPopUp && (
                        <YesNoPopUp
                            title={`Delete ${type.toLowerCase()}`}
                            text={`Are you sure you want to delete this ${type.toLowerCase()}?`}
                            onYes={handleDeletePost}
                            onNo={() => null}
                            hidePopUp={() => {
                                setShowPopUp(false);
                                setOptionsDisplayed(true);
                            }}
                        />
                    )}
                    {user && user.username === author ? (
                        <>
                            {type === "POST" && (
                                <li className={styles.options_menu__option}>
                                    <div className={styles.icon}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24px"
                                            height="24px"
                                            fill="currentColor"
                                        >
                                            <path d="M17,18L12,15.82L7,18V5H17M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z" />
                                        </svg>
                                    </div>
                                    <span>Save</span>
                                </li>
                            )}
                            <li
                                className={styles.options_menu__option}
                                onClick={() => setShowPopUp(true)}
                            >
                                <div className={styles.icon}>
                                    {/*report flag icon*/}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        height="24px"
                                        width="24px"
                                        color="currentColor"
                                    >
                                        <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
                                    </svg>
                                </div>
                                <span>Delete</span>
                            </li>
                        </>
                    ) : (
                        <li className={styles.options_menu__option}>
                            <div className={styles.icon}>
                                {/*report flag icon*/}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="currentColor"
                                >
                                    <path d="M220-130v-650h323.84l16 80H780v360H536.16l-16-80H280v290h-60Zm280-430Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z" />
                                </svg>
                            </div>
                            <span>Report</span>
                        </li>
                    )}
                </ul>
            )}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                fill="currentColor"
            >
                <path d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z" />
            </svg>
        </div>
    );
}
