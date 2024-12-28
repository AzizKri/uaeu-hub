import styles from "./Popup.module.scss";
import React, {useEffect} from "react";

export default function Popup({children, hidePopUp}: { children: React.ReactNode, hidePopUp: () => void }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
    })

    const handleHidePopup = () => {
        document.body.style.overflow = "scroll";
        hidePopUp();
    }

    return (
        <div className={styles.dark_background}>
            <div className={styles.container}>
            <span className={styles.container__cancel} onClick={handleHidePopup}>
                {/*cancel icon*/}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
            </span>
                {children}
            </div>
            {/*<div className={styles.dark_background}/>*/}
        </div>
    )
}
