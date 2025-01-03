import styles from "./ExploreCommunities.module.scss"
import Search from "../Search/Search.tsx";
import Category from "../Category/Category.tsx";

export default function exploreCommunities() {
    const catigories = ["Popular", "Academic", "Sport", "Clubs"];

    return (
        <div className={styles.container}>
            <Search />
            {catigories.map((each) => <Category tag={each}/>)}
        </div>
    )
}
