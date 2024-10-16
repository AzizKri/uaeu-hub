import React, { useState } from 'react';
import styles from './SignUp.module.scss';

export default function SignUp() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        userName: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        email: false,
        userName: false,
        password: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;
        const newErrors = { ...errors };

        if (formData.firstName === '') {
            newErrors.firstName = true;
            hasError = true;
        } else {
            newErrors.firstName = false;
        }

        if (formData.lastName === '') {
            newErrors.lastName = true;
            hasError = true;
        } else {
            newErrors.lastName = false;
        }

        if (formData.email === '') {
            newErrors.email = true;
            hasError = true;
        } else {
            newErrors.email = false;
        }

        if (formData.userName === '') {
            newErrors.userName = true;
            hasError = true;
        } else {
            newErrors.userName = false;
        }

        if (formData.password === '') {
            newErrors.password = true;
            hasError = true;
        } else {
            newErrors.password = false;
        }

        setErrors(newErrors);

        if (!hasError) {
            console.log(formData);
        }
    };

    const handleFocus = () => {
        setErrors({
            firstName: false,
            lastName: false,
            email: false,
            userName: false,
            password: false
        });
    };

    return (
        <div className={styles.signUpBody}>
            <div className={styles.signContainer}>
                <div className={styles.signBox}>
                    <h2>Sign Up</h2>
                    <p>
                        By continuing, you agree to our <a href="#">User Agreement</a> and acknowledge that you
                        understand the <a href="#">Privacy Policy</a>.
                    </p>
                    <div className={styles.socialSign}>
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
                    <div className={styles.separator}>OR</div>
                    <form className={styles.signForm} onSubmit={handleSubmit} noValidate>
                        <div className={styles.nameContainer}>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstName">First Name<span>*</span></label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className={`${styles.formInput} ${errors.firstName ? styles.invalidInput : ''}`}
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus()}
                                />
                                {errors.firstName &&
                                    <small className={styles.error}>Please fill out this field.</small>}
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="lastName">Last Name<span>*</span></label>
                                <input
                                    type="text"
                                    className={`${styles.formInput} ${errors.lastName ? styles.invalidInput : ''}`}
                                    id="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus()}
                                />
                                {errors.lastName && <small className={styles.error}>Please fill out this field.</small>}
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email<span>*</span></label>
                            <input
                                type="text"
                                className={`${styles.formInput} ${errors.email ? styles.invalidInput : ''}`}
                                id="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                            {errors.email && <small className={styles.error}>Please fill out this field.</small>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="userName">Username<span>*</span></label>
                            <input
                                type="text"
                                className={`${styles.formInput} ${errors.userName ? styles.invalidInput : ''}`}
                                id="userName"
                                placeholder="Username"
                                value={formData.userName}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                            {errors.userName && <small className={styles.error}>Please fill out this field.</small>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password<span>*</span></label>
                            <input
                                type="password"
                                className={`${styles.formInput} ${errors.password ? styles.invalidInput : ''}`}
                                id="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus()}
                            />
                            {errors.password && <small className={styles.error}>Please fill out this field.</small>}
                        </div>
                        <button type="submit" className={styles.signupBtn}>Sign up</button>
                    </form>
                    <p>Already a member? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    );
};

