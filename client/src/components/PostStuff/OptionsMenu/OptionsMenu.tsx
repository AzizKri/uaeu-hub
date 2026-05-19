import styles from "./OptionsMenu.module.scss";
import React, { useState } from "react";
import YesNoPopUp from "../../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import ReportPopUp from "../../Reusable/ReportPopUp/ReportPopUp.tsx";
import AdminDeletePopUp from "../../Reusable/AdminDeletePopUp/AdminDeletePopUp.tsx";
import { deleteComment as apiDeleteComment } from "../../../api/comments.ts";
import { deletePost as apiDeletePost } from "../../../api/posts.ts";
import { deleteSubComment as apiDeleteSubComment } from "../../../api/subComments.ts";
import {useUser} from "../../../contexts/user/UserContext.ts";
import {useUpdatePosts} from "../../../contexts/updatePosts/UpdatePostsContext.ts";

interface OptionsMenuProps {
    type: "POST" | "COMMENT" | "SUB-COMMENT";
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
    const [showAdminDeletePopUp, setShowAdminDeletePopUp] = useState<boolean>(false);
    const [showReportPopUp, setShowReportPopUp] = useState<boolean>(false);
    const { deletePost } = useUpdatePosts();
    const { user } = useUser();

    const isAuthor = user && user.username === author;
    const isAdmin = user?.isAdmin;
    const canDelete = isAuthor || isAdmin;

    const getReportEntityType = (): "post" | "comment" | "subcomment" => {
        switch (type) {
            case "POST":
                return "post";
            case "COMMENT":
                return "comment";
            case "SUB-COMMENT":
                return "subcomment";
        }
    };

    const handleReport = () => {
        setShowReportPopUp(true);
    };

    const handleClickOptions: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        document.body.click();
        setOptionsDisplayed(true);
        const listener = () => {
            setOptionsDisplayed(false);
            document.removeEventListener("click", listener);
        };
        document.addEventListener("click", listener);
    };

    const handleDeletePost = async (reason?: string) => {
        if (type === "POST") {
            deletePost(id);
            await apiDeletePost(id, reason);
        } else if (type === "COMMENT") {
            deleteComment!(id);
            await apiDeleteComment(id, reason);
        } else if (type === "SUB-COMMENT") {
            deleteComment!(id);
            await apiDeleteSubComment(id, reason);
        }
    };

    const handleAdminDelete = async (reason: string) => {
        await handleDeletePost(reason);
    };

    const handleDeleteClick = () => {
        if (isAuthor) {
            setShowPopUp(true);
        } else if (isAdmin) {
            setShowAdminDeletePopUp(true);
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
                            onYes={() => handleDeletePost()}
                            onNo={() => null}
                            hidePopUp={() => {
                                setShowPopUp(false);
                                setOptionsDisplayed(true);
                            }}
                        />
                    )}
                    {showAdminDeletePopUp && (
                        <AdminDeletePopUp
                            type={type}
                            onConfirm={handleAdminDelete}
                            onCancel={() => null}
                            hidePopUp={() => {
                                setShowAdminDeletePopUp(false);
                                setOptionsDisplayed(false);
                            }}
                        />
                    )}
                    {showReportPopUp && (
                        <ReportPopUp
                            entityType={getReportEntityType()}
                            entityId={id}
                            hidePopUp={() => {
                                setShowReportPopUp(false);
                                setOptionsDisplayed(false);
                            }}
                        />
                    )}
                    {canDelete && (
                        <li
                            className={styles.options_menu__option}
                            onClick={handleDeleteClick}
                            style={{color: "#f33"}}
                        >
                            <div className={styles.icon}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    height="24px"
                                    width="24px"
                                    fill="currentColor"
                                >
                                    <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
                                </svg>
                            </div>
                            <span>Delete</span>
                        </li>
                    )}
                    {!isAuthor && (
                        <li className={styles.options_menu__option} onClick={handleReport}>
                            <div className={styles.icon}>
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
