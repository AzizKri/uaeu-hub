import styles from "./CommunityIconComponent.module.scss";
import {assetsBase} from "../../../api/api.ts";
import defaultCommunityIcon from "../../../assets/community-icon.jpg";

export default function CommunityIconComponent({source}: {source: string | undefined | null}) {

    return (
        <img
            src={
                source == undefined
                    ? defaultCommunityIcon
                    : `${assetsBase}/icon/${source}`
            }
            alt="community icon"
            className={styles.communityIcon}
        />
    )
}
