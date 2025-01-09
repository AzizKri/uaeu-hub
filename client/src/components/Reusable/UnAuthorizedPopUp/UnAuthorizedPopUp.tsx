import styles from "./UnAuthorizedPopUp.module.scss";
import Popup from "../Popup/Popup.tsx";
import {Link} from "react-router-dom";

export default function UnAuthorizedPopUp({hidePopUp}: {hidePopUp: () => void}) {
    return (
        <Popup hidePopUp={hidePopUp}>
            <p>
                Sorry, you need to <Link to="/signup" className={styles.link} style={{color: "var(--main-color)", textDecoration: "underline"}}>signup</Link> or <Link to="/login" style={{color: "var(--main-color)", textDecoration: "underline"}}>login</Link> to be able to do this action
            </p>
        </Popup>
    )
}
