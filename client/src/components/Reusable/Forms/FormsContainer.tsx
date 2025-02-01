import {ReactNode} from "react";
import styles from "./ReusableForms.module.scss";

export default function FormsContainer({children}: {children: ReactNode}) {
    return (
        <div className={styles.form}>
            {children}
        </div>
    )
}
