import Search from '../Search/Search.tsx';
import styles from './NavBar.module.scss';
import {useUser} from "../../../lib/hooks.ts";
import React, {useState} from "react";
import {Link} from "react-router-dom";
import logo from '../../../assets/logo-text-2.svg';

export default function NavBar() {
    const {user} = useUser();
    const [zIndex, setZIndex] = useState(4);

    const showAside: React.MouseEventHandler<HTMLDivElement> = () => {
        const left = document.getElementById("left");
        const overlay = document.getElementById("overlay");
        left?.classList.toggle("active");
        overlay?.classList.toggle("active");
        setZIndex(prev => prev ? 4 : 10);
    }
    return (
        <>
            <div className={styles.navbar} style={{zIndex: zIndex}}>
                <div className={styles.menu} onClick={showAside}>
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
                        <img src={logo} alt="main logo"/>
                    </div>
                </Link>
                <Search />
                <div className={styles.right}>
                    {user && !user.new && !user.isAnonymous ? (
                        <>
                            <h3>{user.username}</h3>
                            <h4>{user.displayName}</h4>
                            <p>{user.bio}</p>
                        </>
                    ) : (
                        <div className={styles.auth_buttons}>
                            <Link to="/signup" className={styles.signup}>
                                Sign Up
                            </Link>
                            <Link to="/login" className={styles.login}>
                                Log In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
