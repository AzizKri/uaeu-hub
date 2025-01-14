import React, {useState} from 'react';
import styles from '../Forms.module.scss';
import {login} from '../../../api/authentication.ts';
import {Link, useNavigate} from 'react-router-dom';
import {useUser} from "../../../lib/utils/hooks.ts";
import {useGoogleLogin} from "@react-oauth/google";

export default function Login() {
    const navigate = useNavigate();
    const {updateUser} = useUser();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });

    const [errors, setErrors] = useState<LoginErrors>({});

    const [isLoading, setIsLoading] = useState(false);
    const [passwordShown, setPasswordShown] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setFormData({...formData, [id]: value});
        setIsLoading(false);
        return;
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
                    identifier: "Please enter a valid email or username",
                });
            } else {
                setErrors({
                    password: "Please enter a valid password",
                });
            }
            setIsLoading(false);
            return;
        }

        const response = await login(formData);
        console.log("login response:", response);
        const data = await response.json();
        if (response.status === 200) {
            console.log('Log in success:', response);
            updateUser({
                new: false,
                username: data.username,
                displayName: data.displayName,
                bio: data.bio,
                pfp: data.pfp
            })
            navigate(-1);
        } else {
            const newErrors: LoginErrors = {};
            if (response.status === 404) {
                newErrors.global = 'User not found check the entered email.';
            } else if (response.status === 401) {
                newErrors.global = 'Invalid password';
            } else {
                newErrors.global = 'Something went wrong please try again';
            }
            setErrors(newErrors);
        }
        setIsLoading(false);
    };

    const googleLogin = useGoogleLogin({
        onSuccess: codeResponse => console.log(codeResponse),
    });

    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <h2 className={styles.subTitle}>Log In</h2>
                    <p className={styles.textParagraph}>
                        By continuing, you agree to our <Link to="#" className={styles.formLink}>User
                        Agreement</Link> and
                        acknowledge that you understand the <Link to="#" className={styles.formLink}>Privacy
                        Policy</Link>.
                    </p>
                    <div className={styles.socialForm}>
                        <button className={styles.socialBtn} onClick={() => googleLogin()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25"
                                 preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" id="google">
                                <path fill="#4285F4"
                                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                                <path fill="#34A853"
                                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                                <path fill="#FBBC05"
                                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
                                <path fill="#EB4335"
                                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    </div>
                    {errors.global && <strong className={styles.error}>{errors.global}</strong>}
                    <div className={styles.separator}>OR</div>
                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                Email or username <span>*</span>
                            </label>
                            <input
                                type="text"
                                className={`${styles.formInput} ${errors.identifier ? styles.invalidInput : ''}`}
                                id="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                                placeholder="Email or username"
                                required
                            />
                            {errors.identifier && <small className={styles.error}>{errors.identifier}</small>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.formLabel}>
                                Password <span>*</span>
                            </label>
                            <input
                                type={passwordShown ? "text" : "password"}
                                className={`${styles.formInput} ${errors.password ? styles.invalidInput : ''}`}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                                placeholder="Password"
                                required
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
                            {errors.password && <small className={styles.error}>{errors.password}</small>}
                        </div>
                        <Link to="#" className={styles.forgotPassword}>
                            Forgot password?
                        </Link>
                        <button type="submit" className={styles.formBtn} disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <p className={styles.textParagraph}>
                        New to UAEU Chat? <Link to="/signup" className={styles.formLink}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

