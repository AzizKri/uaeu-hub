import React, { useState } from 'react';
import styles from '../../styles/Forms.module.scss';
import { useNavigate } from 'react-router-dom';
import {isAnon, signUp} from '../../api.ts';
import YesNoPopUp from "../YesNoPopUp/YesNoPopUp.tsx";
import {userSchema} from "../../userSchema.ts";
import { z } from 'zod';
import {useUser} from "../../lib/hooks.ts";

export default function SignUp() {
    const navigate = useNavigate();
    const {updateUser} = useUser();

    const [formData, setFormData] = useState({
        displayname: '',
        email: '',
        username: '',
        password: '',
        includeAnon: true
    });
    const [errors, setErrors] = useState<signUpErrors>({});

    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const parseResult = userSchema.safeParse(formData);
        if (!parseResult.success) {
            const newErrors: signUpErrors = {};
            parseResult.error.issues.forEach((issue : z.ZodIssue) => {
                const fieldName = issue.path[0] as keyof signUpErrors;
                newErrors[fieldName] = issue.message;
            });
            console.log(newErrors);
            setErrors(newErrors);
            return;
        }
        setIsLoading(true);

        const isUserResponse = await isAnon();
        if (isUserResponse) {
            setShowPopup(true);
        } else {
            await processSignup(false);
        }
        setIsLoading(false);
    };

    const processSignup = async (includeAnon: boolean) => {
        const payload = { ...formData, includeAnon };
        const response = await signUp(payload);

        if (response.status === 200) {
            console.log('Sign up success:', response);
            updateUser({
                username: response.username,
                displayName: response.displayName,
                bio: response.bio,
                pfp: response.pfp
            })
            navigate('/');
        } else {
            const newErrors: signUpErrors = {};
            response.errors.forEach((err: ServerError) => {
                if (err.field) {
                    newErrors[err.field as keyof signUpErrors] = err.message;
                } else {
                    newErrors.global = err.message;
                }
            });
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
    };

    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <h2 className={styles.subTitle}>Sign Up</h2>
                    <p className={styles.textParagraph}>
                        By continuing, you agree to our <a href="#" className={styles.formLink}>User Agreement</a> and acknowledge that you
                        understand the <a href="#" className={styles.formLink}>Privacy Policy</a>.
                    </p>
                    <div className={styles.socialForm}>
                        <button className={styles.socialBtn}>
                            <svg className="custom-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="25"
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
                            <div className={styles.formGroup}>
                                <label htmlFor="username" className={styles.formLabel}>Username<span>*</span></label>
                                <input
                                    type="text"
                                    className={`${styles.formInput} ${errors.username ? styles.invalidInput : ''}`}
                                    id="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus()}
                                />
                                {errors.username && <small className={styles.error}>{errors.username}</small>}
                            </div>
                            <label htmlFor="displayname" className={styles.formLabel}>Display Name</label>
                            <input
                                type="text"
                                id="displayname"
                                className={`${styles.formInput}`}
                                placeholder="Display Name"
                                value={formData.displayname}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>Email<span>*</span></label>
                            <input
                                type="text"
                                className={`${styles.formInput} ${errors.email ? styles.invalidInput : ''}`}
                                id="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                            {errors.email && <small className={styles.error}>{errors.email}</small>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.formLabel}>Password<span>*</span></label>
                            <input
                                type="password"
                                className={`${styles.formInput} ${errors.password ? styles.invalidInput : ''}`}
                                id="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                            {errors.password && <small className={styles.error}>{errors.password}</small>}
                        </div>
                        <button type="submit" className={styles.formBtn} disabled={isLoading}>
                            {isLoading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </form>
                    <p className={styles.textParagraph}>Already a member? <a href="/login"
                                                                             className={styles.formLink}>Login</a></p>
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

