import styles from "./Aside.module.scss";
import { useEffect, useState } from "react";
import accountIcon from "../../assets/account-outline-thin.svg";
import communityIcon from "../../assets/account-group-outline-thin.svg";
import homeIcon from "../../assets/home-outline-thin.svg";
import logoutIcon from "../../assets/logout-thin.svg";
import courseMaterial from "../../assets/course-material.svg";
import professorIcon from "../../assets/professor.svg";
import redirectImg from "../../assets/redirect_square.svg"
import YesNoPopUp from "../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import ThreeDotsLine from "../Reusable/Animations/ThreeDotsLine/ThreeDotsLine.tsx";
import { logout } from "../../api/authentication.ts";
import { getCommunitiesCurrentUser } from "../../api/currentUser.ts";
import CreateCommunity from "../Communities/CreateCommunity/CreateCommunity.tsx";
import {useUser} from "../../contexts/user/UserContext.ts";
import {inActivateLeft} from "../../utils/tools.ts";
// import bookmarkIcon from "../../assets/bookmark-outline-thin.svg";
// import settingIcon from "../../assets/cog-outline-thin.svg";

export default function Aside() {
    const [showCommunity, setShowCommunity] = useState<boolean>(false);
    const [active, setActive] = useState<string>("home");
    const [logoutPopUpShown, setLogoutPopUpShown] = useState<boolean>(false);
    const [myCommunities, setMyCommunities] = useState<CommunityINI[]>();
    const [loadingMyCommunities, setLoadingMyCommunities] = useState<boolean>(false);
    const { isUser, user, removeUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [redirectPopUpShown, setRedirectPopUpShown] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>("");
    const [showCreateCommunityModal, setShowCreateCommunityModal] = useState<boolean>(false);

    useEffect(() => {
        const ptr = /\/(\w+)\//;
        const match = location.pathname.match(ptr);
        if (!match) {
            setActive("home");
        } else {
            setActive(match[1]);
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        const response = await logout();
        if (response == 200) {
            removeUser();
            window.location.reload();
        } else {
            console.log("Error logging out", response);
        }
    };

    const handleCommunities = () => {
        if (!isUser()) {
            navigate("/community/explore");
            inActivateLeft();
        } else {
            setShowCommunity((prev) => !prev);
            if (myCommunities === undefined) {
                setLoadingMyCommunities(true);
                getCommunitiesCurrentUser().then((res) => {
                    setMyCommunities(res.data);
                    setLoadingMyCommunities(false);
                });
            }
        }
    };

    const handleSpaceRead = (to: string) => {
        setSelected(to);
        setRedirectPopUpShown(true);
    };
    const handleRedirect = () => {
        window.open(`https://spaceread.net/${selected}`, "_blank");
        inActivateLeft();
    };

    const handleCreate = async () => {
        setShowCreateCommunityModal(true);
    };

    const handleHome = () => {
        navigate('/');
        setActive("home");
        inActivateLeft();
    }

    const handleProfile = () => {
        navigate(`/user/${user?.username}`);
        setActive("profile");
        inActivateLeft();
    }

    return (
        <ul
            className={styles.aside}
            onMouseLeave={() => {
                setShowCommunity(false);
            }}
        >
            <li>
                <div onClick={handleHome}>
                    <div
                        className={`${styles.top_element} ${styles.element} ${active === "home" && styles.active}`}
                    >
                        <img src={homeIcon} alt="home" />
                        <span>HOME</span>
                    </div>
                </div>
            </li>
            {isUser() && (
                <li>
                    <div
                        onClick={handleProfile}
                    >
                        <div
                            className={`${styles.top_element} ${styles.element} ${active === "user" && styles.active}`}
                        >
                            <img src={accountIcon} alt="profile icon" />
                            <span>PROFILE</span>
                        </div>
                    </div>
                </li>
            )}
            <li>
                <div
                    className={`
                        ${styles.top_element}
                        ${styles.element}
                        ${active === "community" && styles.active}
                    `}
                    onClick={handleCommunities}
                >
                    <img src={communityIcon} alt="community icon" />
                    <span>COMMUNITIES</span>
                    {isUser() && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24px"
                            height="24px"
                            fill="currentColor"
                        >
                            <path d="M 7.122 8.87 C 7.337 8.653 7.47 8.663 7.679 8.849 L 11.713 12.883 C 11.941 13.11 12.038 13.103 12.287 12.883 L 16.321 8.849 L 16.59 8.58 L 16.854 8.846 L 17.714 9.712 L 18 10 L 17.67 10.33 L 12.727 15.273 C 12.122 15.829 11.904 15.839 11.273 15.273 L 6.247 10.247 C 6.059 10.059 6.072 9.941 6.26 9.739 L 7.122 8.87 Z" />
                        </svg>
                    )}
                </div>
                <ul
                    className={styles.inner_list}
                    style={{ maxHeight: showCommunity ? "100vh" : "0" }}
                >
                    <li>
                        <div onClick={() => {
                            navigate("/community/explore");
                            inActivateLeft();
                        }}>
                            <div
                                className={`${styles.inner_element} ${styles.element}`}
                            >
                                <svg
                                    style={{ padding: "2px" }}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M15.5,2C13,2 11,4 11,6.5C11,9 13,11 15.5,11C16.4,11 17.2,10.7 17.9,10.3L21,13.4L22.4,12L19.3,8.9C19.7,8.2 20,7.4 20,6.5C20,4 18,2 15.5,2M4,4A2,2 0 0,0 2,6V20A2,2 0 0,0 4,22H18A2,2 0 0,0 20,20V15L18,13V20H4V6H9.03C9.09,5.3 9.26,4.65 9.5,4H4M15.5,4C16.9,4 18,5.1 18,6.5C18,7.9 16.9,9 15.5,9C14.1,9 13,7.9 13,6.5C13,5.1 14.1,4 15.5,4Z" />
                                </svg>
                                <span>Explore</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div
                            className={`${styles.inner_element} ${styles.element}`}
                            onClick={handleCreate}
                        >
                            {/*plus icon*/}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                            </svg>
                            <span>Create</span>
                        </div>
                    </li>
                    {loadingMyCommunities ? (
                        <div style={{ height: "30px" }}>
                            <ThreeDotsLine />
                        </div>
                    ) : (
                        myCommunities && myCommunities.length &&
                        myCommunities.map((community) => (
                            <li key={community.name}>
                                <div onClick={() => {
                                    navigate(`/community/${community.name}`);
                                    inActivateLeft();
                                }}>
                                    <div
                                        className={`${styles.user_community} ${styles.element}`}
                                    >
                                        <img
                                            src={community.icon}
                                            alt="community"
                                            className={styles.community_icon}
                                        />
                                        <span>{community.name}</span>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </li>
            {/*{isUser() && (*/}
            {/*    <li>*/}
            {/*        <div*/}
            {/*            className={`${styles.top_element} ${styles.element} ${active === "setting" && styles.active}`}*/}
            {/*        >*/}
            {/*            <img src={bookmarkIcon} alt="bookmark" />*/}
            {/*            <span>SAVED</span>*/}
            {/*        </div>*/}
            {/*    </li>*/}
            {/*)}*/}
            <li>
                <div
                    className={`${styles.top_element} ${styles.element} ${active === "setting" && styles.active}`}
                    onClick={() => handleSpaceRead("course")}
                >
                    <img src={courseMaterial} alt="settings" />
                    <span>COURSES MATERIAL</span>
                    <img src={redirectImg} className={styles.redirectLogo} alt="redirect" />
                </div>
            </li>
            <li>
                <div
                    className={`${styles.top_element} ${styles.element} ${active === "setting" && styles.active}`}
                    onClick={() => handleSpaceRead("professor")}
                >
                    <img src={professorIcon} alt="settings" />
                    <span>PROFESSORS</span>
                    <img src={redirectImg} className={styles.redirectLogo} alt="redirect" />
                </div>
            </li>
            {/*<li>*/}
            {/*    <div*/}
            {/*        className={`${styles.top_element} ${styles.element} ${active === "setting" && styles.active}`}*/}
            {/*    >*/}
            {/*        <img src={settingIcon} alt="settings" />*/}
            {/*        <span>SETTINGS</span>*/}
            {/*    </div>*/}
            {/*</li>*/}
            {isUser() && (
                <li>
                    <div
                        className={`${styles.top_element} ${styles.element} ${active === "logout" && styles.active}`}
                        onClick={() => setLogoutPopUpShown(true)}
                    >
                        <img src={logoutIcon} alt="logut icon" />
                        <span>LOGOUT</span>
                    </div>
                </li>
            )}
            {logoutPopUpShown && (
                <YesNoPopUp
                    title="Log Out!"
                    text="Are you sure you want to log out?"
                    onYes={handleLogout}
                    onNo={() => null}
                    hidePopUp={() => setLogoutPopUpShown(false)}
                />
            )}
            {redirectPopUpShown && (
                <YesNoPopUp
                    title="Redirect"
                    text="You will be redirected to SpaceRead"
                    onYes={() => handleRedirect()}
                    onNo={() => null}
                    hidePopUp={() => setRedirectPopUpShown(false)}
                    yesText="Go"
                    noText="Stay"
                />
            )}
            {showCreateCommunityModal && (
                <CreateCommunity type="CREATE" onClose={() => setShowCreateCommunityModal(false)}/>
            )}
        </ul>
    );
}
