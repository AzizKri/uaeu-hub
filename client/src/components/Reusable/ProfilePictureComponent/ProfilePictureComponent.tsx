import styles from "./ProfilePictureComponent.module.scss";
import defaultProfilePicture from "../../../assets/profile-picture.png";
import {assetsBase} from "../../../api/api.ts";
import {memo, SyntheticEvent} from "react";

function ProfilePictureComponent({source}: {source: string | null | undefined}) {

    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = defaultProfilePicture;
    };

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
            onError={handleError}
        />
    )
}

export default memo(ProfilePictureComponent);
