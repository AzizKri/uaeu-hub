import {FormEvent, ReactNode} from "react";
import styles from "./ReusableForms.module.scss";

interface FormsContainerProps {
    children: ReactNode;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export default function FormsContainer({ children, onSubmit }: FormsContainerProps) {
    return (
        <form className={styles.form} onSubmit={onSubmit}>
            {children}
        </form>
    )
}
