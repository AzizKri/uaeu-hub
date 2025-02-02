import styles from "./ReusableForms.module.scss";
import React, {useState} from "react";
import Requirement from "../../UserAccounts/Requirement/Requirement.tsx";

type itemType = "text" | "password" | "area"
type Width = string | number | undefined;

interface Props {
    type: itemType,
    id: string,
    label: string,
    placeholder?: string,
    required?: boolean,
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onFocus?: (isPassword: boolean | undefined, showRequirements: boolean | undefined) => void,
    error?: string,
    width?: Width,
    togglePassword?: boolean,
    showPasswordRequirements?: boolean,
    isPasswordActive?: boolean,
    isPassword?: boolean,
}

export default function FormItem(
    {
        type,
        id,
        label,
        placeholder = "",
        required = false,
        value = "",
        onChange,
        onFocus,
        error,
        width,
        togglePassword,
        showPasswordRequirements,
        isPassword = false,
        isPasswordActive = false,
    } : Props
){

    const [passwordShown, setPasswordShown] = useState<boolean>(false);
    const [reqErrors, setReqErrors] = useState<requirementErrors>({
        passLengthError: true,
        passLowerError: true,
        passUpperError: true,
        passNumberError: true,
        passSpecialError: true,
    });



    const checkRequirements = (password : string)=> {
        const upperCasePattern = /[A-Z]/;
        const lowerCasePattern = /[a-z]/;
        const numberPattern = /\d/;
        const specialPattern = /[^a-zA-Z0-9]/;
        setReqErrors({
            passLengthError: password.length < 8,
            passLowerError: !lowerCasePattern.test(password),
            passUpperError: !upperCasePattern.test(password),
            passNumberError: !numberPattern.test(password),
            passSpecialError: !specialPattern.test(password),
        });
    };

    return (
        <div className={styles.formGroup}>
            <label
                htmlFor={id}
                className={styles.formLabel}
            >
                {label}{required && (<span>*</span>)}
            </label>
            <input
                type={isPassword ? (passwordShown ? "text" : "password") : type}
                className={`${styles.formInput} ${error ? styles.invalidInput : ""}`}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    if (onChange) onChange(e);

                    if (showPasswordRequirements) {
                        checkRequirements(e.target.value);
                    }
                }}
                onFocus={() => {
                    if (onFocus) onFocus(isPassword, showPasswordRequirements);
                }}
                style={{width: width}}
            />
            {(isPassword && togglePassword) && (
                <span className={styles.showPassword} onClick={() => setPasswordShown((prev) => !prev)}>
                                {passwordShown ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24px"
                                        height="24px"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z"/>
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24px"
                                        height="24px"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z"/>
                                    </svg>
                                )}
                            </span>
            )}
            {error && (
                <small className={styles.error}>
                    {error}
                </small>
            )}

            {(isPasswordActive && showPasswordRequirements && isPassword) && (
                <>
                    <Requirement text={"Password must be at least 8 characters long"} error={reqErrors.passLengthError} />
                    <Requirement text={"Password must contain at least one uppercase letter"} error={reqErrors.passUpperError} />
                    <Requirement text={"Password must contain at least one lowercase letter"} error={reqErrors.passLowerError} />
                    <Requirement text={"Password must contain at least one number"} error={reqErrors.passNumberError} />
                    <Requirement text={"Password must contain at least one special character"} error={reqErrors.passSpecialError} />
                </>
            )}
        </div>
    )
}
