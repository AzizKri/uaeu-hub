import React, { useState } from 'react';
import styles from '../Forms.module.scss';
import { login} from '../../../api/authentication.ts';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../lib/utils/hooks.ts';
import GoogleAuth from "../GoogleAuth/GoogleAuth.tsx";

export default function Login() {
    const navigate = useNavigate();
    const { updateUser } = useUser();
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });

    // console.log("previous location", window.history.)

    const [errors, setErrors] = useState<LoginErrors>({});

    const [isLoading, setIsLoading] = useState(false);
    const [passwordShown, setPasswordShown] = useState<boolean>(false);
    const location = useLocation();
    const previousPage = location.state?.from;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setIsLoading(false);
        return;
    };
    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value.toLowerCase() });
    };

    const handleFocus = () => {
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);
        if (formData.identifier.trim() === '' || formData.password.trim() === '') {
            if (formData.identifier.trim() === '') {
                setErrors({
                    identifier: 'Please enter a valid email or username'
                });
            } else {
                setErrors({
                    password: 'Please enter a valid password'
                });
            }
            setIsLoading(false);
            return;
        }

        const response = await login(formData);
        console.log('login response:', response);
        const data = await response.json();
        if (response.status === 200) {
            console.log('Log in success:', response);
            updateUser({
                new: false,
                username: data.username,
                displayName: data.displayName,
                bio: data.bio,
                pfp: data.pfp
            });
            navigate(previousPage);
        } else {
            const newErrors: LoginErrors = {};
            if (response.status === 404) {
                newErrors.global = data.message;
            } else if (response.status === 401) {
                newErrors.global = data.message;
            } else {
                newErrors.global = 'Something went wrong please try again';
            }
            setErrors(newErrors);
        }
        setIsLoading(false);
    };


    const handleGoToSignup = () => {
        navigate('/signup', {state: {from: previousPage}});
    }

    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <h2 className={styles.subTitle}>Log In</h2>
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
                    <GoogleAuth setErrors={setErrors} setIsLoading={setIsLoading} />
                    {errors.global && (
                        <strong className={styles.error}>
                            {errors.global}
                        </strong>
                    )}
                    <div className={styles.separator}>OR</div>
                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                Email or username <span>*</span>
                            </label>
                            <input
                                type="text"
                                className={`${styles.formInput} ${errors.identifier ? styles.invalidInput : ""}`}
                                id="identifier"
                                value={formData.identifier}
                                onChange={handleChangeUsername}
                                onFocus={() => handleFocus()}
                                placeholder="Email or username"
                                required
                            />
                            {errors.identifier && (
                                <small className={styles.error}>
                                    {errors.identifier}
                                </small>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label
                                htmlFor="password"
                                className={styles.formLabel}
                            >
                                Password <span>*</span>
                            </label>
                            <input
                                type={passwordShown ? "text" : "password"}
                                className={`${styles.formInput} ${errors.password ? styles.invalidInput : ""}`}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                                placeholder="Password"
                                required
                            />
                            <span
                                className={styles.showPassword}
                                onClick={() =>
                                    setPasswordShown((prev) => !prev)
                                }
                            >
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
                            {errors.password && (
                                <small className={styles.error}>
                                    {errors.password}
                                </small>
                            )}
                        </div>
                        <Link to="#" className={styles.forgotPassword}>
                            Forgot password?
                        </Link>
                        <button
                            type="submit"
                            className={styles.formBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                    <p className={styles.textParagraph}>
                        New to UAEU Chat?{" "}
                        <span
                            className={styles.formLink}
                            onClick={handleGoToSignup}
                        >
                            Sign Up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
;

