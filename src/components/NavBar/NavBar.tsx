import Search from "../Search.tsx";
import style from './NavBar.module.scss';
import {useState} from "react";

enum Page {
    Home,
    Questions
}

export default function NavBar() {
    const [page, setPage] = useState<Page>(Page.Home);

    return (
        <>
            <div className={style.navbar}>
                <div className={style.navbar_logo}>UAEU</div>
                <div className={style.navbar_buttons}>
                    <div className={page === Page.Home ? style.selectedButton : style.button}
                         onClick={() => setPage(Page.Home)}>Home
                    </div>
                    <div className={page === Page.Questions ? style.selectedButton : style.button}
                         onClick={() => setPage(Page.Questions)}>Your Questions
                    </div>
                </div>
                <Search/>
            </div>
        </>
    );
}
