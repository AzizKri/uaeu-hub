import {useUser} from "../../lib/hooks.ts";
import styles from "./Right.module.scss"

export default function Right() {
    const {user} = useUser();

    return (
        <div className={styles.right}>
            {user ? (
                <>
                    <h3>{user.username}</h3>
                    <h4>{user.displayName}</h4>
                    <p>{user.bio}</p>
                </>
            ) : (
                <>
                    <a href="/signup">Sign Up</a>
                    <a href="/login">Log In</a>
                </>
            )}

        </div>
    )


}
