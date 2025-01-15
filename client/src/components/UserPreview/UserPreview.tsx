import styles from "./UserPreview.module.scss";
import {Link} from "react-router-dom";
import profilePicture from "../../assets/profile-picture.png";

export default function UserPreview({ user }: { user: UserInfo }) {
    return (
        <Link to={`/user/${user.username}`}>
            <div className={styles.user}>
                <img
                    className={styles.pfp}
                    src={user.pfp ? user.pfp : profilePicture}
                    alt="user profile picture"
                />
                <div className={styles.names}>
                    <div className={styles.displayName}>{user.displayName}</div>
                    <div className={styles.username}>@{user.username}</div>
                </div>
            </div>
        </Link>
    );
}
