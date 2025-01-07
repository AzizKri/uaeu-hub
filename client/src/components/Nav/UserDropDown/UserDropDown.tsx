import { useState } from "react";
import styles from "./UserDropDown.module.scss"; // Create a CSS module for styling

export default function UserDropDown ({username, onUsernameClick, onNotificationClick, onLogoutClick} : {
    username: string,
    onUsernameClick: () => void,
    onNotificationClick: () => void,
    onLogoutClick: () => void,
}){
    const [isOpen, setIsOpen] = useState(false);


    return (
        <div
            className={styles.userIconWrapper}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* User Icon */}
            <div className={styles.userIcon}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    id="user"
                    height="43px"
                >
                    <path
                        fill="#231f20"
                        d="M7.763 2A6.77 6.77 0 0 0 1 8.763c0 1.807.703 3.505 1.98 4.782a6.718 6.718 0 0 0 4.783 1.981 6.77 6.77 0 0 0 6.763-6.763A6.77 6.77 0 0 0 7.763 2ZM3.675 13.501a5.094 5.094 0 0 1 3.958-1.989c.024.001.047.007.071.007h.023c.022 0 .042-.006.064-.007a5.087 5.087 0 0 1 3.992 2.046 6.226 6.226 0 0 1-4.02 1.468 6.212 6.212 0 0 1-4.088-1.525zm4.032-2.494c-.025 0-.049.004-.074.005a2.243 2.243 0 0 1-2.167-2.255 2.246 2.246 0 0 1 2.262-2.238 2.246 2.246 0 0 1 2.238 2.262c0 1.212-.97 2.197-2.174 2.232-.028-.001-.056-.006-.085-.006Zm4.447 2.215a5.594 5.594 0 0 0-3.116-2.052 2.749 2.749 0 0 0 1.428-2.412A2.747 2.747 0 0 0 7.704 6.02a2.747 2.747 0 0 0-2.738 2.762 2.73 2.73 0 0 0 1.422 2.386 5.602 5.602 0 0 0-3.081 1.995 6.22 6.22 0 0 1-1.806-4.398 6.27 6.27 0 0 1 6.263-6.263 6.27 6.27 0 0 1 6.263 6.263 6.247 6.247 0 0 1-1.873 4.457z"
                    ></path>
                </svg>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={styles.dropdown}>
                    <button className={styles.dropdownItem} onClick={onUsernameClick}>
                        <strong>{username}</strong>
                    </button>
                    <button
                        className={styles.dropdownItem}
                        onClick={onNotificationClick}
                    >
                        Notifications
                    </button>
                    <button className={styles.dropdownItem} onClick={onLogoutClick}>
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
};

