import styles from './Aside.module.scss';
import community_icon_placeholder from "../../assets/community-icon.jpg"
import {useState} from "react";

import accountIcon from "../../assets/account-outline-thin.svg"
import communityIcon from "../../assets/account-group-outline-thin.svg"
import bookmarkIcon from "../../assets/bookmark-outline-thin.svg"
import arrowDownIcon from "../../assets/chevron-down.svg"
import settingIcon from "../../assets/cog-outline-thin.svg"
import homeIcon from "../../assets/home-outline-thin.svg"
import logoutIcon from "../../assets/logout-thin.svg"
import courseMaterial from '../../assets/course-material.svg'
import professorIcon from '../../assets/professor.svg'
import { createCommunity, logout } from '../../api.ts';
import {useUser} from "../../lib/hooks.ts";
import YesNoPopUp from "../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import {Link, useNavigate} from "react-router-dom";

export default function Aside() {
    const [showCommunity, setShowCommunity] = useState<boolean>(false);
    const [active, setActive] = useState<string>("home");
    const [logoutPopUpShown, setLogoutPopUpShown] = useState<boolean>(false);
    const my_communities = [
        {icon: community_icon_placeholder, name: "community1"},
        {icon: community_icon_placeholder, name: "community2"}
    ];
    const {user, removeUser} = useUser();
    const navigate = useNavigate();
    const [redirectPopUpShown, setRedirectPopUpShown] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>("");

    const handleLogout = async () => {
        console.log("logout");
        const response = await logout()
        if (response == 200) {
            removeUser();
        } else {
            console.log("Error singing out", response);
        }
    }

    const handleCommunities = () => {
        if (user && !user.isAnonymous) {
            setShowCommunity((prev) => !prev);
        } else {
            navigate('/community')
        }
    }

    const handleSpaceRead = (to: string) => {
        setSelected(to);
        setRedirectPopUpShown(true);
    }
    const handleRedirect= () => {
        window.open(`https://spaceread.net/${selected}`, "_blank")
    }

    // TEST FUNCTION
    const handleCreate = async () => {
        const response = await createCommunity("General", "This is the general community", ["UAEU", "Study", "Gaming", "Hobbies", "Jobs"])
        if (response == 200) {
            console.log("Community created")
        } else {
            console.log("Error creating community", response)
        }
    }

    // TEST FUNCTION
    // const handleJoin = async () => {
    //     const response = await joinCommunity(6)
    //     if (response == 200) {
    //         console.log("Community joined")
    //     } else {
    //         console.log("Error joining community", response)
    //     }
    // }
    //
    // // TEST FUNCTION
    // const handleLeave = async () => {
    //     const response = await leaveCommunity(6)
    //     if (response == 200) {
    //         console.log("Community joined")
    //     } else {
    //         console.log("Error joining community", response)
    //     }
    // }

    return (
        <ul
            className={styles.aside}
            onMouseLeave={() => {setShowCommunity(false)}}
          >
            <li>
                <Link to="/" onClick={() => setActive("home")}>
                    <div className={`${styles.top_element} ${styles.element} ${active === 'home' && styles.active}`}>
                        <img src={homeIcon} alt="home"/>
                        <span>HOME</span>
                    </div>
                </Link>
            </li>
            <li>
                <Link to={`/user/${user?.username}`} onClick={() => setActive("profile")}>
                    <div className={`${styles.top_element} ${styles.element} ${active === 'profile' && styles.active}`}>
                        <img src={accountIcon} alt="profile icon"/>
                        <span>PROFILE</span>
                    </div>
                </Link>
            </li>
            <li>
                <div
                    className={`
                        ${styles.top_element}
                        ${styles.element}
                        ${active === 'communities' && styles.active}
                    `}
                    onClick={handleCommunities}
                >
                    <img src={communityIcon} alt="community icon"/>
                    <span>COMMUNITIES</span>
                    <img src={arrowDownIcon} alt="arrow down icon"/>
                </div>
                <ul className={styles.inner_list} style={{maxHeight: showCommunity ? "100vh" : "0"}}>
                    <li>
                        <Link to="/community/explore">
                            <div className={`${styles.inner_element} ${styles.element}`}>
                                <svg style={{padding: "2px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill="currentColor">
                                    <path
                                        d="M15.5,2C13,2 11,4 11,6.5C11,9 13,11 15.5,11C16.4,11 17.2,10.7 17.9,10.3L21,13.4L22.4,12L19.3,8.9C19.7,8.2 20,7.4 20,6.5C20,4 18,2 15.5,2M4,4A2,2 0 0,0 2,6V20A2,2 0 0,0 4,22H18A2,2 0 0,0 20,20V15L18,13V20H4V6H9.03C9.09,5.3 9.26,4.65 9.5,4H4M15.5,4C16.9,4 18,5.1 18,6.5C18,7.9 16.9,9 15.5,9C14.1,9 13,7.9 13,6.5C13,5.1 14.1,4 15.5,4Z"/>
                                </svg>
                                <span>Explore</span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <div className={`${styles.inner_element} ${styles.element}`} onClick={handleCreate}>
                            {/*plus icon*/}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                            </svg>
                            <span>Create</span>
                        </div>
                    </li>
                    {my_communities.map((community) => (<li key={community.name}>
                            <Link to={`/community/${community.name}`}>
                                <div className={`${styles.user_community} ${styles.element}`}>
                                    <img src={community.icon} alt="community" className={styles.community_icon}/>
                                    <span>{community.name}</span>
                                </div>
                            </Link>
                        </li>))}
                </ul>
            </li>
            {user && !user.isAnonymous && <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'setting' && styles.active}`}>
                    <img src={bookmarkIcon} alt="bookmark"/>
                    <span>SAVED</span>
                </div>
            </li>}
        <li>
            <div className={`${styles.top_element} ${styles.element} ${active === 'setting' && styles.active}`} onClick={() => handleSpaceRead("course")}>
                <img src={courseMaterial} alt="settings"/>
                <span>COURSES MATERIAL</span>
            </div>
        </li>
        <li>
            <div className={`${styles.top_element} ${styles.element} ${active === 'setting' && styles.active}`} onClick={() => handleSpaceRead("professor")}>
                <img src={professorIcon} alt="settings"/>
                <span>PROFESSORS</span>
            </div>
        </li>
            <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'setting' && styles.active}`}>
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*    <path*/}
                    {/*        d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>*/}
                    {/*</svg>*/}
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*    <path*/}
                    {/*        d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z"/>*/}
                    {/*</svg>*/}
                    <img src={settingIcon} alt="settings"/>
                    <span>SETTINGS</span>
                </div>
            </li>
            {user && !user.isAnonymous && <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'logout' && styles.active}`}
                     onClick={() => setLogoutPopUpShown(true)}>
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*    <path*/}
                    {/*        d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12M4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>*/}
                    {/*</svg>*/}
                    <img src={logoutIcon} alt="logut icon"/>
                    <span>LOGOUT</span>
                </div>
            </li>}
            {logoutPopUpShown && <YesNoPopUp
                title="Log Out!"
                text="Are you sure you want to log out?"
                onYes={handleLogout}
                onNo={() => null}
                hidePopUp={() => setLogoutPopUpShown(false)}
            />}
        {redirectPopUpShown && <YesNoPopUp
            title="Redirect"
            text="You will be redirected to SpaceRead"
            onYes={() => handleRedirect()}
            onNo={() => null}
            hidePopUp={() => setRedirectPopUpShown(false)}
            yesText="Go"
            noText="Stay"
        />}
        </ul>)
}
