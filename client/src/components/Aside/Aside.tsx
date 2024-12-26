import styles from './Aside.module.scss';
import community_icon_placeholder from "../../assets/community-icon.jpg"
import {useState} from "react";

export default function Aside() {
    const [showCommunity, setShowCommunity] = useState<boolean>(false);
    const [active, setActive] = useState<string>("home");
    const my_communities = [{icon: community_icon_placeholder, name: "community1"}, {icon: community_icon_placeholder, name: "community2"}];

    return (
        <ul className={styles.aside}>
            <li>
                <a href="/">
                    <div className={`${styles.top_element} ${styles.element} ${active === 'home' && styles.active}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                        </svg>
                        HOME
                    </div>
                </a>
            </li>
            <li>
                <a href={`/user/`} onClick={() => setActive("profile")}>
                    <div className={`${styles.top_element} ${styles.element} ${active === 'profile' && styles.active}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                        </svg>
                        PROFILE
                    </div>
                </a>
            </li>
            <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'communities' && styles.active}`}
                     onClick={() => setShowCommunity((prev) => !prev)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
                    </svg>
                    COMMUNITIES
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{transform: `rotate(${showCommunity ? "180" : "0"}deg)`}}>
                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                    </svg>
                </div>
                <ul className={styles.inner_list} style={{maxHeight: showCommunity ? "100vh" : "0"}}>
                    <li>
                        <a href="/community">
                            <div className={`${styles.inner_element} ${styles.element}`}>
                                <svg style={{padding: "2px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill="currentColor">
                                    <path
                                        d="M15.5,2C13,2 11,4 11,6.5C11,9 13,11 15.5,11C16.4,11 17.2,10.7 17.9,10.3L21,13.4L22.4,12L19.3,8.9C19.7,8.2 20,7.4 20,6.5C20,4 18,2 15.5,2M4,4A2,2 0 0,0 2,6V20A2,2 0 0,0 4,22H18A2,2 0 0,0 20,20V15L18,13V20H4V6H9.03C9.09,5.3 9.26,4.65 9.5,4H4M15.5,4C16.9,4 18,5.1 18,6.5C18,7.9 16.9,9 15.5,9C14.1,9 13,7.9 13,6.5C13,5.1 14.1,4 15.5,4Z"/>
                                </svg>
                                Explore
                            </div>
                        </a>
                    </li>
                    <li>
                        <div className={`${styles.inner_element} ${styles.element}`}>
                            {/*plus icon*/}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                            </svg>
                            Create
                        </div>
                    </li>
                    {my_communities.map((community) => (
                        <li key={community.name} className={`${styles.user_community} ${styles.element}`}>
                            <img src={community.icon} alt="community" className={styles.community_icon}/>
                            <span>{community.name}</span>
                        </li>
                    ))}
                </ul>
            </li>
            <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'setting' && styles.active}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                    </svg>
                    SETTINGS
                </div>
            </li>
            <li>
                <div className={`${styles.top_element} ${styles.element} ${active === 'logout' && styles.active}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12M4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>
                    </svg>
                    LOGOUT
                </div>
            </li>
        </ul>
    )
}
