import styles from './Aside.module.scss';
import community_icon_placeholder from "../../assets/community-icon.jpg"
import {useState} from "react";

import accountIcon from "../../assets/account-outline.svg"
import communityIcon from "../../assets/account-group-outline.svg"
import bookmarkIcon from "../../assets/bookmark-outline.svg"
import arrowDownIcon from "../../assets/chevron-down.svg"
import settingIcon from "../../assets/cog-outline.svg"
import homeIcon from "../../assets/home-outline.svg"
import logoutIcon from "../../assets/logout.svg"

export default function Aside() {
    const [showCommunity, setShowCommunity] = useState<boolean>(false);
    const [active, setActive] = useState<string>("home");
    const my_communities = [{icon: community_icon_placeholder, name: "community1"}, {icon: community_icon_placeholder, name: "community2"}];

    return (
        <ul className={styles.aside}>
            <li>
                <a href="/">
                    <div className={`${styles.top_element} ${styles.element} ${active === 'home' && styles.active}`}>
                        {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                        {/*    <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>*/}
                        {/*</svg>*/}
                        {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                        {/*    <path*/}
                        {/*        d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22"/>*/}
                        {/*</svg>*/}
                        <img src={homeIcon} alt="home"/>
                        <span>HOME</span>
                    </div>
                </a>
            </li>
            <li>
                <a href={`/user/`} onClick={() => setActive("profile")}>
                    <div className={`${styles.top_element} ${styles.element} ${active === 'profile' && styles.active}`}>
                        {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                        {/*    <path*/}
                        {/*        d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>*/}
                        {/*</svg>*/}
                        {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                        {/*    <path*/}
                        {/*        strokeWidth="1"*/}
                        {/*        d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M12,13C14.67,13 20,14.33 20,17V20H4V17C4,14.33 9.33,13 12,13M12,14.9C9.03,14.9 5.9,16.36 5.9,17V18.1H18.1V17C18.1,16.36 14.97,14.9 12,14.9Z"/>*/}
                        {/*</svg>*/}
                        <img src={accountIcon} alt="profile icon"/>
                        <span>PROFILE</span>
                    </div>
                </a>
            </li>
            <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'communities' && styles.active}`}
                     onClick={() => setShowCommunity((prev) => !prev)}>
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*    <path*/}
                    {/*        d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>*/}
                    {/*</svg>*/}
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*    <path*/}
                    {/*        d="M12,5A3.5,3.5 0 0,0 8.5,8.5A3.5,3.5 0 0,0 12,12A3.5,3.5 0 0,0 15.5,8.5A3.5,3.5 0 0,0 12,5M12,7A1.5,1.5 0 0,1 13.5,8.5A1.5,1.5 0 0,1 12,10A1.5,1.5 0 0,1 10.5,8.5A1.5,1.5 0 0,1 12,7M5.5,8A2.5,2.5 0 0,0 3,10.5C3,11.44 3.53,12.25 4.29,12.68C4.65,12.88 5.06,13 5.5,13C5.94,13 6.35,12.88 6.71,12.68C7.08,12.47 7.39,12.17 7.62,11.81C6.89,10.86 6.5,9.7 6.5,8.5C6.5,8.41 6.5,8.31 6.5,8.22C6.2,8.08 5.86,8 5.5,8M18.5,8C18.14,8 17.8,8.08 17.5,8.22C17.5,8.31 17.5,8.41 17.5,8.5C17.5,9.7 17.11,10.86 16.38,11.81C16.5,12 16.63,12.15 16.78,12.3C16.94,12.45 17.1,12.58 17.29,12.68C17.65,12.88 18.06,13 18.5,13C18.94,13 19.35,12.88 19.71,12.68C20.47,12.25 21,11.44 21,10.5A2.5,2.5 0 0,0 18.5,8M12,14C9.66,14 5,15.17 5,17.5V19H19V17.5C19,15.17 14.34,14 12,14M4.71,14.55C2.78,14.78 0,15.76 0,17.5V19H3V17.07C3,16.06 3.69,15.22 4.71,14.55M19.29,14.55C20.31,15.22 21,16.06 21,17.07V19H24V17.5C24,15.76 21.22,14.78 19.29,14.55M12,16C13.53,16 15.24,16.5 16.23,17H7.77C8.76,16.5 10.47,16 12,16Z"/>*/}
                    {/*</svg>*/}
                    <img src={communityIcon} alt="community icon"/>
                    <span>COMMUNITIES</span>
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"*/}
                    {/*     style={{transform: `rotate(${showCommunity ? "180" : "0"}deg)`}}>*/}
                    {/*    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>*/}
                    {/*</svg>*/}
                    <img src={arrowDownIcon} alt="arrow down icon"/>
                </div>
                <ul className={styles.inner_list} style={{maxHeight: showCommunity ? "100vh" : "0"}}>
                    <li>
                        <a href="/community/explore">
                            <div className={`${styles.inner_element} ${styles.element}`}>
                                <svg style={{padding: "2px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill="currentColor">
                                    <path
                                        d="M15.5,2C13,2 11,4 11,6.5C11,9 13,11 15.5,11C16.4,11 17.2,10.7 17.9,10.3L21,13.4L22.4,12L19.3,8.9C19.7,8.2 20,7.4 20,6.5C20,4 18,2 15.5,2M4,4A2,2 0 0,0 2,6V20A2,2 0 0,0 4,22H18A2,2 0 0,0 20,20V15L18,13V20H4V6H9.03C9.09,5.3 9.26,4.65 9.5,4H4M15.5,4C16.9,4 18,5.1 18,6.5C18,7.9 16.9,9 15.5,9C14.1,9 13,7.9 13,6.5C13,5.1 14.1,4 15.5,4Z"/>
                                </svg>
                                <span>Explore</span>
                            </div>
                        </a>
                    </li>
                    <li>
                        <div className={`${styles.inner_element} ${styles.element}`}>
                            {/*plus icon*/}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                            </svg>
                            <span>Create</span>
                        </div>
                    </li>
                    {my_communities.map((community) => (
                        <li key={community.name}>
                            <a href={`/community/${community.name}`}>
                                <div className={`${styles.user_community} ${styles.element}`}>
                                    <img src={community.icon} alt="community" className={styles.community_icon}/>
                                    <span>{community.name}</span>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </li>
            <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'setting' && styles.active}`}>
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">*/}
                    {/*    <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>*/}
                    {/*</svg>*/}
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*    <path d="M17,18L12,15.82L7,18V5H17M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>*/}
                    {/*</svg>*/}
                    <img src={bookmarkIcon} alt="bookmark"/>
                    <span>SAVED</span>
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
            <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'logout' && styles.active}`}>
                    {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*    <path*/}
                    {/*        d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12M4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>*/}
                    {/*</svg>*/}
                    <img src={logoutIcon} alt="logut icon"/>
                    <span>LOGOUT</span>
                </div>
            </li>
        </ul>
    )
}
