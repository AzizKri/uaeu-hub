import Search from "../Search/Search.tsx";
import styles from "./NavBar.module.scss";
import { useUser } from "../../../lib/utils/hooks.ts";
import {useEffect, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import logo from "../../../assets/logo-text-2.svg";


export default function NavBar() {
    const { isUser, user} = useUser();
    const leftRef = useRef<HTMLElement | null>(null);
    const overlayRef = useRef<HTMLElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        leftRef.current = document.getElementById("left");
        overlayRef.current = document.getElementById("overlay");
        console.log(user)
    }, []);

    const handleShowAside = () => {
        if (leftRef.current && overlayRef.current) {
            leftRef.current?.classList.toggle("active");
            overlayRef.current?.classList.toggle("active");

            const handleOverlayClick = () => {
                leftRef.current?.classList.remove("active");
                overlayRef.current?.classList.remove("active");
                overlayRef.current?.removeEventListener("click", handleOverlayClick);
            }

            if (leftRef.current.classList.contains("active")) {
                overlayRef.current.addEventListener("click", handleOverlayClick);
            }
        }
    }

    const handleIconClick = () => {
        navigate(`/user/${user?.username}`);
    };

    // const handleUsernameClick = () => {
    //     startTransition(() => {
    //         navigate(`/user/${user?.username}`);
    //     })
    // };
    //
    // const handleNotificationClick = () => {
    //     console.log("Notifcation");
    // };
    //
    // const handleLogoutClick = async () => {
    //     console.log("logout");
    //     const response = await logout();
    //     if (response == 200) {
    //         removeUser();
    //         window.location.reload();
    //     } else {
    //         console.log("Error logging out", response);
    //     }
    // };

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
                            <div className={styles.userIcon} onClick={handleIconClick}>
                                {user?.pfp ? (
                                    <img src={user.pfp} className={styles.userPfp} alt="profile picture"/>
                                ) : (
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
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/signup" className={styles.signup}>
                                    Sign Up
                                </Link>
                                <Link to="/login" className={styles.login}>
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
