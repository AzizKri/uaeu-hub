import React, { useState } from 'react';
import styles from '../../styles/Forms.module.scss';
import {login} from '../../api.ts';
import { useNavigate } from 'react-router-dom';
import {useUser} from "../../lib/hooks.ts";

export default function Login() {
    const navigate = useNavigate();
    const {updateUser} = useUser();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<loginErrors>({});

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleFocus = () => {
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);
        if (formData.email.trim() === '' || formData.password.trim() === '') {
            if (formData.email.trim() === ''){
                setErrors({
                    email: "Please enter a valid email or username",
                });
            }
            else{
                setErrors({
                    password: "Please enter a valid password",
                });
            }
            setIsLoading(false);
            return;
        }

        if (formData.email.split('@').length !== 1) {
            setFormData({
                username: formData.email,
                email: '',
                password: formData.password,
            })
        }
        const response = await login(formData);
        const data = await response.json();
        if (response.status === 200) {
            console.log('Log in success:', response);
            updateUser({
                username: data.username,
                displayName: data.displayName,
                bio: data.bio,
                pfp: data.pfp
            })
            navigate('/');
        } else {
            const newErrors: loginErrors = {};
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


    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <h2 className={styles.subTitle}>Log In</h2>
                    <p className={styles.textParagraph}>
                        By continuing, you agree to our <a href="#" className={styles.formLink}>User Agreement</a> and
                        acknowledge that you understand the <a href="#" className={styles.formLink}>Privacy Policy</a>.
                    </p>
                    <div className={styles.socialForm}>
                        <button className={styles.socialBtn}>
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
                                className={`${styles.formInput} ${errors.email ? styles.invalidInput : ''}`}
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                                placeholder="Email or username"
                                required
                            />
                            {errors.email && <small className={styles.error}>{errors.email}</small>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.formLabel}>
                                Password <span>*</span>
                            </label>
                            <input
                                type="password"
                                className={`${styles.formInput} ${errors.password ? styles.invalidInput : ''}`}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                                placeholder="Password"
                                required
                            />
                            {errors.password && <small className={styles.error}>{errors.password}</small>}
                        </div>
                        <a href="#" className={styles.forgotPassword}>
                            Forgot password?
                        </a>
                        <button type="submit" className={styles.formBtn} disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <p className={styles.textParagraph}>
                        New to UAEU Chat? <a href="/signup" className={styles.formLink}>Sign Up</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

