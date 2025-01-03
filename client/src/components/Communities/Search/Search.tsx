import styles from "./Search.module.scss";
import searchIcon from "../../../assets/search.svg";

export default function Search (){

    return (
        <div className={styles.container}>
            <img src={searchIcon} alt="search icon" />
            <input placeholder="Search Communities..." />
        </div>
    )
}
