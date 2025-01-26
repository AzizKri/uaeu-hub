import styles from "./ProfilePictureComponent.module.scss";
import defaultProfilePicture from "../../../assets/profile-picture.png";
import {assetsBase} from "../../../api/api.ts";
import {memo} from "react";

function ProfilePictureComponent({source}: {source: string | null | undefined}) {

    return (
        <img
            src={
                source
                    ? source.startsWith("http") || source.startsWith("data")
                        ? source
                        : `${assetsBase}/pfp/${source}`
                    : defaultProfilePicture
            }
            alt={"profile picture"}
            className={styles.img}
        />
    )
}

export default memo(ProfilePictureComponent);
