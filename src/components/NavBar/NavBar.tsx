import Search from "../Search.tsx";
import styles from './NavBar.module.scss';
import {useState} from "react";

enum Page {
    Home,
    Questions
}

export default function NavBar() {
    const [page, setPage] = useState<Page>(Page.Home);

    return (
        <>
            <div className={styles.navbar}>
                <div className={styles.navbar_logo}>UAEU</div>
                <div className={styles.navbar_buttons}>
                    <div className={page === Page.Home ? styles.selectedButton : styles.button}
                         onClick={() => setPage(Page.Home)}>Home
                    </div>
                    <div className={page === Page.Questions ? styles.selectedButton : styles.button}
                         onClick={() => setPage(Page.Questions)}>Your Questions
                    </div>
                </div>
                <Search/>
            </div>
        </>
    );
}
