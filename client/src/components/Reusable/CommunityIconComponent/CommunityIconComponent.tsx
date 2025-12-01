import styles from "./CommunityIconComponent.module.scss";
import { assetsBase } from "../../../api/api.ts";
import defaultCommunityIcon from "../../../assets/community-icon.jpg";
import {memo, SyntheticEvent} from "react";

function CommunityIconComponent({
    source,
}: {
    source: string | undefined | null;
}) {
    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = defaultCommunityIcon;
    };

    return (
        <img
            src={
                source == undefined
                    ? defaultCommunityIcon
                    : source.startsWith("data")
                      ? source
                      : `${assetsBase}/icon/${source}`
            }
            alt="community icon"
            className={styles.communityIcon}
            onError={handleError}
        />
    );
}

export default memo(CommunityIconComponent);
