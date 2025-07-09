import Search from "../Search/Search.tsx";
import styles from "./NavBar.module.scss";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-text-2.svg";
import { goToAuth } from "../../../utils/tools.ts";
import ProfilePictureComponent from "../../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";
import Notification from "../../Notifications/Notification.tsx";

export default function NavBar() {
    const { isUser, user } = useUser();
    const leftRef = useRef<HTMLElement | null>(null);
    const overlayRef = useRef<HTMLElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        leftRef.current = document.getElementById("left");
        overlayRef.current = document.getElementById("overlay");
        console.log(user);
        console.log(import.meta.env.VITE_ASSETS_URL)
    }, []);

    const handleShowAside = () => {
        if (leftRef.current && overlayRef.current) {
            leftRef.current?.classList.toggle("active");
            overlayRef.current?.classList.toggle("active");

            const handleOverlayClick = () => {
                leftRef.current?.classList.remove("active");
                overlayRef.current?.classList.remove("active");
                overlayRef.current?.removeEventListener(
                    "click",
                    handleOverlayClick,
                );
            };

            if (leftRef.current.classList.contains("active")) {
                overlayRef.current.addEventListener(
                    "click",
                    handleOverlayClick,
                );
            }
        }
    };

    const handleIconClick = () => {
        window.location.assign(`/user/${user?.username}`);
        // navigate(`/user/${user?.username}`);
    };

    return (
        <>
            <div className={styles.navbar}>
                <div className={styles.menu} onClick={handleShowAside}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="32px"
                        height="32px"
                        fill="currentColor"
                    >
                        <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
                    </svg>
                </div>
                <Link to="/">
                    <div className={styles.navbar_logo}>
                        <img src={logo} alt="main logo" />
                    </div>
                </Link>
                <Search />
                <div className={styles.right}>
                    <div className={styles.auth_buttons}>
                        {isUser() ? (
                            <>
                            <Notification />
                            <div
                                className={styles.userIcon}
                                onClick={handleIconClick}
                            >
                                <ProfilePictureComponent source={user?.pfp} />
                            </div>
                            </>
                        ) : (
                            <>
                                <div
                                    onClick={() => goToAuth(navigate, "SIGNUP")}
                                    className={`${styles.signup} ${styles.btn}`}
                                >
                                    Sign Up
                                </div>
                                <div
                                    onClick={() => goToAuth(navigate, "LOGIN")}
                                    className={`${styles.login} ${styles.btn}`}
                                >
                                    Log In
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
