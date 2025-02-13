import styles from "./CommunityIconComponent.module.scss";
import { assetsBase } from "../../../api/api.ts";
import defaultCommunityIcon from "../../../assets/community-icon.jpg";
import {memo} from "react";

function CommunityIconComponent({
    source,
}: {
    source: string | undefined | null;
}) {
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
        />
    );
}

export default memo(CommunityIconComponent);
