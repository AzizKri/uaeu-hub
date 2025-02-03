import { FormEvent, ReactNode, useState, useEffect, useCallback } from "react";
import styles from "./ReusableForms.module.scss";
import Requirement from "../../UserAccounts/Requirement/Requirement.tsx";

interface FormsContainerProps {
    children: ReactNode;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading?: boolean;
    loadingButtonText?: string;
    buttonText?: string;
    password?: string;
    isPasswordActive?: boolean;
}

export default function FormsContainer({ children, onSubmit, isLoading, loadingButtonText, buttonText, password, isPasswordActive }: FormsContainerProps) {

    const [reqErrors, setReqErrors] = useState<requirementErrors>({
        passLengthError: true,
        passLowerError: true,
        passUpperError: true,
        passNumberError: true,
        passSpecialError: true,
    });

    const checkRequirements = useCallback((pass: string) => {
        const upperCasePattern = /[A-Z]/;
        const lowerCasePattern = /[a-z]/;
        const numberPattern = /\d/;
        const specialPattern = /[^a-zA-Z0-9]/;
        setReqErrors({
            passLengthError: pass.length < 8,
            passLowerError: !lowerCasePattern.test(pass),
            passUpperError: !upperCasePattern.test(pass),
            passNumberError: !numberPattern.test(pass),
            passSpecialError: !specialPattern.test(pass),
        });
    }, []);

    useEffect(() => {
        if (isPasswordActive) {
            checkRequirements(password || '');
        }
    }, [password, isPasswordActive, checkRequirements]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} >
            {children}
            {(reqErrors && isPasswordActive) && (
                <>
                    <Requirement text={"Password must be at least 8 characters long"} error={reqErrors.passLengthError} />
                    <Requirement text={"Password must contain at least one uppercase letter"} error={reqErrors.passUpperError} />
                    <Requirement text={"Password must contain at least one lowercase letter"} error={reqErrors.passLowerError} />
                    <Requirement text={"Password must contain at least one number"} error={reqErrors.passNumberError} />
                    <Requirement text={"Password must contain at least one special character"} error={reqErrors.passSpecialError} />
                </>
            )}
            <button
                type="submit"
                className={styles.formBtn}
                disabled={isLoading}
            >
                {isLoading ? loadingButtonText : buttonText}
            </button>
        </form>
    )
}
