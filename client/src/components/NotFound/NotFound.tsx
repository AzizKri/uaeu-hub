import styles from "./NotFound.module.scss";
import NavBar from '../NavBar/NavBar.tsx';

export default function NotFound() {
    return (
        <>
            <NavBar />
            <div className={styles.notFound}>
                <h1>404</h1>
                <h2>Page not found</h2>
            </div>
        </>
    )
}
