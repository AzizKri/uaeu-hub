import styles from "./UnAuthorizedPopUp.module.scss";
import Modal from "../Modal/Modal.tsx";
import { Link } from "react-router-dom";

export default function UnAuthorizedPopUp({
    hidePopUp,
}: {
    hidePopUp: () => void;
}) {
    return (
        <Modal onClose={hidePopUp}>
            <p>
                Sorry, you need to
                <Link
                    to="/signup"
                    className={styles.link}
                >
                    {` signup `}
                </Link>
                or
                <Link
                    to="/login"
                    className={styles.link}
                >
                    {` login `}
                </Link>
                to be able to do this action
            </p>
        </Modal>
    );
}
