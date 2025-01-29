import React, { useState } from 'react';
import styles from '../Forms.module.scss';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {sendEmailVerification, signUp} from '../../../api/authentication.ts';
import {isAnon} from '../../../api/currentUser.ts';
import YesNoPopUp from "../../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import {userSchema} from "../../../userSchema.ts";
import { z } from 'zod';
import Requirement from "../Requirement/Requirement.tsx";
import GoogleAuth from "../GoogleAuth/GoogleAuth.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";

export default function SignUp() {
    const navigate = useNavigate();
    const {updateUser} = useUser();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        username: '',
        password: '',
        includeAnon: true
    });
    const [errors, setErrors] = useState<SignUpErrors>({});
    const [reqErrors, setReqErrors] = useState<requirementErrors>({
        passLengthError: true,
        passLowerError: true,
        passUpperError: true,
        passNumberError: true,
        passSpecialError: true,
    });
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordShown, setPasswordShown] = useState<boolean>(false);
    const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);
    const location = useLocation();
    const previousPage = location.state?.from;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (id === "password") {
            checkRequirements(value);
        }
    };

    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value.toLowerCase() });
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const parseResult = userSchema.safeParse(formData);
        if (!parseResult.success) {
            const newErrors: SignUpErrors = {};
            parseResult.error.issues.forEach((issue : z.ZodIssue) => {
                const fieldName = issue.path[0] as keyof SignUpErrors;
                newErrors[fieldName] = issue.message;
            });
            console.log(newErrors);
            setErrors(newErrors);
            return;
        }
        setIsLoading(true);

        const isAnonResponse = await isAnon();
        if (isAnonResponse) {
            setShowPopup(true);
        } else {
            await processSignup(false);
        }
        setIsLoading(false);
    };

    const processSignup = async (includeAnon: boolean) => {
        const p = { ...formData, includeAnon };
        const payload = {
            username: p.username,
            displayname: p.displayName,
            email: p.email,
            password: p.password,
            includeAnon: includeAnon
        }
        const response = await signUp(payload);
        const data = await response.json();
        if (response.status === 200 || response.status === 201) {
            console.log('Sign up success:', response);
            updateUser({
                new: false,
                username: data.username,
                displayName: data.displayName,
                bio: data.bio,
                pfp: data.pfp
            })
            await sendEmailVerification();
            navigate(previousPage);
        } else {
            const newErrors: SignUpErrors = {};
            if (response.status === 409) {
                newErrors.global = 'User already exists';
            } else {
                newErrors.global = 'Something went wrong please try again';
            }
            setErrors(newErrors);
        }
    };

    const handlePopupResponse = async (choice: boolean) => {
        // setShowPopup(false);
        setIsLoading(true);
        await processSignup(choice);
        setIsLoading(false);
    };

    const handleHidePopUp = async () => {
        setShowPopup(false);
        setIsLoading(false);
        // await processSignup(false);
    }

    const handleFocus = () => {
        setErrors({});
        setIsLoading(false);
        setIsPasswordActive(false)
    };

    const handleFocusPassword = () => {
        handleFocus();
        setIsPasswordActive(true);
    }

    const handleGoToLogin = () => {
        navigate('/login', {state: {from: previousPage}});
    }

    const goBack = () => {
        navigate('/');
    }

    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <div className={styles.arrow_container} onClick={() => goBack()}>
                        {/*back button*/}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                        </svg>
                    </div>
                    <h2 className={styles.subTitle}>Sign Up</h2>
                    <p className={styles.textParagraph}>
                        By continuing, you agree to our{" "}
                        <Link to="#" className={styles.formLink}>
                            User Agreement
                        </Link>{" "}
                        and acknowledge that you understand the{" "}
                        <Link to="#" className={styles.formLink}>
                            Privacy Policy
                        </Link>
                        .
                    </p>
                    <GoogleAuth setErrors={setErrors} setIsLoading={setIsLoading} onSubmit={() => navigate(previousPage)}/>
                    <div className={styles.separator}>OR</div>
                    {errors.global && (
                        <p className={styles.error}>
                            {errors.global}
                        </p>
                    )}
                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className={styles.formGroup}>
                            <div className={styles.formGroup}>
                                <label
                                    htmlFor="username"
                                    className={styles.formLabel}
                                >
                                    Username<span>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`${styles.formInput} ${errors.username ? styles.invalidInput : ""}`}
                                    id="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChangeUsername}
                                    onFocus={() => handleFocus()}
                                />
                                {errors.username && (
                                    <small className={styles.error}>
                                        {errors.username}
                                    </small>
                                )}
                            </div>
                            <label
                                htmlFor="displayName"
                                className={styles.formLabel}
                            >
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                className={`${styles.formInput} ${errors.displayName ? styles.invalidInput : ""}`}
                                placeholder="Display Name"
                                value={formData.displayName}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                            {errors.displayName && (
                                <small className={styles.error}>
                                    {errors.displayName}
                                </small>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                Email<span>*</span>
                            </label>
                            <input
                                type="text"
                                className={`${styles.formInput} ${errors.email ? styles.invalidInput : ""}`}
                                id="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                            {errors.email && (
                                <small className={styles.error}>
                                    {errors.email}
                                </small>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label
                                htmlFor="password"
                                className={styles.formLabel}
                            >
                                Password<span>*</span>
                            </label>
                            <input
                                type={passwordShown ? "text" : "password"}
                                className={`${styles.formInput} ${errors.password ? styles.invalidInput : ""}`}
                                id="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocusPassword()}
                            />
                            <span className={styles.showPassword} onClick={() => setPasswordShown((prev) => !prev)}>
                                {passwordShown ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24px"
                                        height="24px"
                                        fill="currentColor"
                                    >
                                        <path d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24px"
                                        height="24px"
                                        fill="currentColor"
                                    >
                                        <path d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z" />
                                    </svg>
                                )}
                            </span>
                            {errors.password && (
                                <small className={styles.error}>
                                    {errors.password}
                                </small>
                            )}
                            {isPasswordActive ? (
                                <>
                                <Requirement text={"Password must be at least 8 characters long"} error={reqErrors.passLengthError} />
                                <Requirement text={"Password must contain at least one uppercase letter"} error={reqErrors.passUpperError} />
                                <Requirement text={"Password must contain at least one lowercase letter"} error={reqErrors.passLowerError} />
                                <Requirement text={"Password must contain at least one number"} error={reqErrors.passNumberError} />
                                <Requirement text={"Password must contain at least one special character"} error={reqErrors.passSpecialError} />
                                </>
                                ) : (<span></span>
                        )}
                        </div>
                        <button
                            type="submit"
                            className={styles.formBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing up..." : "Sign up"}
                        </button>
                    </form>
                    <p className={styles.textParagraph}>
                        Already a member?{" "}
                        <span className={styles.formLink} onClick={handleGoToLogin}>
                            Login
                        </span>
                    </p>
                </div>
            </div>
            {showPopup && (
                <YesNoPopUp
                    title="Include Your Previous Posts?"
                    text="We noticed you may already have content associated with an
                          anonymous session. Would you like to attach that content to
                          your new account?"
                    onYes={() => handlePopupResponse(true)}
                    onNo={() => handlePopupResponse(false)}
                    hidePopUp={handleHidePopUp}
                />
            )}
        </div>
    );
};

