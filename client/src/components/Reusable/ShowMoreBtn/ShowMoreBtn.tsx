import styles from "./ShowMoreBtn.module.scss";
import ThreeDotsLine from "../Animations/ThreeDotsLine/ThreeDotsLine.tsx";

export default function ShowMoreBtn({onClick, isLoadingMore}: {onClick: () => void, isLoadingMore: boolean}) {

    return (
        <button className={styles.show_more} onClick={onClick}>
            {isLoadingMore ? <ThreeDotsLine /> : "Show More"}
        </button>
    )
}
