import React, { useState } from 'react';
import styles from '../Forms.module.scss';
import { lookupEmail, me } from '../../../api/authentication';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GoogleAuth from "../GoogleAuth/GoogleAuth.tsx";
import { useUser } from "../../../contexts/user/UserContext.ts";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";
import { auth, signInWithEmailAndPassword } from '../../../firebase/config';

export default function Login() {
    const navigate = useNavigate();
    const { updateUser } = useUser();
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });

    const [errors, setErrors] = useState<LoginErrors>({});

    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const previousPage = location.state?.from;

    const handleFocus = () => {
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

        try {
            // Determine if the identifier is an email or username
            let email = formData.identifier;

            // If it doesn't look like an email, look up the email for the username
            if (!formData.identifier.includes('@')) {
                const lookupResult = await lookupEmail(formData.identifier);
                if (lookupResult.error || !lookupResult.email) {
                    setErrors({ global: lookupResult.error || 'User not found' });
                    setIsLoading(false);
                    return;
                }
                email = lookupResult.email;
            }

            // Sign in with Firebase
            await signInWithEmailAndPassword(auth, email, formData.password);

            // Get user data from backend
            const data = await me();
            if (data) {
                updateUser({
                    new: false,
                    username: data.username,
                    displayName: data.displayname,
                    bio: data.bio,
                    pfp: data.pfp
                });
            }

            goBack();
        } catch (error: unknown) {
            console.error('Login error:', error);
            const newErrors: LoginErrors = {};

            // Handle Firebase auth errors
            const firebaseError = error as { code?: string };
            if (firebaseError.code === 'auth/user-not-found') {
                newErrors.global = 'User not found';
            } else if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
                newErrors.global = 'Invalid credentials';
            } else if (firebaseError.code === 'auth/invalid-email') {
                newErrors.global = 'Invalid email address';
            } else if (firebaseError.code === 'auth/too-many-requests') {
                newErrors.global = 'Too many failed attempts. Please try again later.';
            } else {
                newErrors.global = 'Something went wrong, please try again';
            }
            setErrors(newErrors);
        }
        setIsLoading(false);
    };


    const handleGoToSignup = () => {
        navigate('/signup', { state: { from: previousPage } });
    }

    const goBack = () => {
        navigate(previousPage ? previousPage : "/");
    }

    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <div className={styles.arrow_container} onClick={() => goBack()}>
                        {/*back button*/}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
                        </svg>
                    </div>
                    <h2 className={styles.subTitle}>Log In</h2>
                    <p className={styles.textParagraph}>
                        By continuing, you agree to our{" "}
                        <Link to="/terms" className={styles.formLink}>
                            User Agreement
                        </Link>{" "}
                        and acknowledge that you understand the{" "}
                        <Link to="/privacy" className={styles.formLink}>
                            Privacy Policy
                        </Link>
                        .
                    </p>
                    <GoogleAuth setErrors={setErrors} setIsLoading={setIsLoading} onSubmit={() => navigate(previousPage)} />
                    <div className={styles.separator}>OR</div>
                    {errors.global && (
                        <p className={styles.error}>
                            {errors.global}
                        </p>
                    )}
                    <FormsContainer onSubmit={handleSubmit} isLoading={isLoading} buttonText={"Login"} loadingButtonText={"Logging in..."}>
                        <FormItem
                            type="text"
                            id="identifier"
                            label="Email or Username"
                            placeholder="Email or Username"
                            required={true}
                            value={formData.identifier} // Pass value from parent state
                            onChange={(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.id]: e.target.value.toLowerCase() }) }}    // Use your existing handler
                            onFocus={handleFocus}
                            error={errors.identifier}
                        />
                        <FormItem
                            type="password"
                            id="password"
                            label="Password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.id]: e.target.value }) }}
                            onFocus={handleFocus}
                            error={errors.password}
                            isPassword={true}
                            togglePassword={true}
                        />
                        <Link to="/reset-password-form" className={styles.forgotPassword}>
                            Forgot password?
                        </Link>
                    </FormsContainer>
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
};
