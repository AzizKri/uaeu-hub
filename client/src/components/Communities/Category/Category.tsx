import styles from "./Category.module.scss";
import communityIcon from "../../../assets/community-icon.jpg";
import {joinCommunity} from "../../../api.ts";
import memberIcon from "../../../assets/account-outline-thin-dot.svg";
import {useEffect, useState} from "react";

interface communityPreview {
    icon: string;
    name: string;
    id: number;
    members: number;
    isMember: boolean;
}

const communitiesTemp: communityPreview[] = [
    {icon: communityIcon, name: "Community1", id: 1, members: 100, isMember: false},
    {icon: communityIcon, name: "Community2", id: 2, members: 200, isMember: true},
    {icon: communityIcon, name: "longer name here", id: 3, members: 300, isMember: false},
    {icon: communityIcon, name: "Community4", id: 4, members: 400, isMember: false},
    {icon: communityIcon, name: "Community5", id: 5, members: 500, isMember: true},
];

export default function Category({tag}: {tag: string}) {
    const [communities, setCommunities] = useState<communityPreview[]>([]);
    const [more, setMore] = useState<boolean>(true);
    useEffect(() => {
        setCommunities(communitiesTemp);
    }, [])

    const handleShowAll = () => {
        setCommunities((prev) => [...prev, ...communitiesTemp]);
        setMore(false);
    }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>{tag}</h4>
            <div className={styles.communities}>
                {communities.map((com) => (
                    <div className={styles.communityPreview}>
                        <img src={com.icon} alt={`${com.name} Community`} className={styles.communityIcon}/>
                        <div className={styles.info}>
                            <div className={styles.communityName}>{com.name}</div>
                            <div className={styles.members}>
                                <img src={memberIcon} alt="member"/>
                                {`${com.members} `}
                                {/*member*/}
                            </div>
                        </div>
                        {!com.isMember && <button className={styles.join} onClick={() => joinCommunity(com.id)}>Join</button>}
                    </div>
                ))}
                {more && <button className={styles.showAll} onClick={handleShowAll}>Show All</button>}
            </div>
        </div>
    )
}
