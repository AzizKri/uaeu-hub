import React, { useState } from 'react';
import styles from '../Forms.module.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { checkUsername, register, upgradeAnonymous } from '../../../api/authentication';
import YesNoPopUp from "../../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import { userSchema } from "../../../userSchema.ts";
import { z } from 'zod';
import GoogleAuth from "../GoogleAuth/GoogleAuth.tsx";
import { useUser } from "../../../contexts/user/UserContext.ts";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";
import ConfirmationPopUp from "../../UserAuthentication/ConfirmationPopUp/ConfirmationPopUp.tsx";
import {
    auth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    linkWithCredential,
    EmailAuthProvider,
} from '../../../firebase/config';

export default function SignUp() {
    const navigate = useNavigate();
    const { updateUser, isFirebaseAnonymous, getFirebaseUser } = useUser();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        username: '',
        password: '',
        includeAnon: true
    });
    const [errors, setErrors] = useState<SignUpErrors>({});
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const previousPage = location.state?.from;
    const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id === "username" || id === "email") {
            setFormData({ ...formData, [id]: value.toLowerCase() });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        // Validate form data with Zod
        const parseResult = userSchema.safeParse(formData);
        if (!parseResult.success) {
            const newErrors: SignUpErrors = {};
            parseResult.error.issues.forEach((issue: z.ZodIssue) => {
                const fieldName = issue.path[0] as keyof SignUpErrors;
                newErrors[fieldName] = issue.message;
            });
            console.log(newErrors);
            setErrors(newErrors);
            return;
        }
        setIsLoading(true);

        try {
            // First, check if username is available
            const usernameCheck = await checkUsername(formData.username);
            if (!usernameCheck.available) {
                setErrors({ username: usernameCheck.message || 'Username is already taken' });
                setIsLoading(false);
                return;
            }

            // Check if user is currently anonymous (has anonymous data)
            if (isFirebaseAnonymous()) {
                setShowPopup(true);
            } else {
                await processSignup(false);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setErrors({ global: 'Something went wrong. Please try again.' });
        }
        setIsLoading(false);
    };

    const processSignup = async (includeAnon: boolean) => {
        try {
            const firebaseUser = getFirebaseUser();

            if (includeAnon && firebaseUser?.isAnonymous) {
                // Upgrade anonymous account to email/password account
                const credential = EmailAuthProvider.credential(formData.email, formData.password);
                await linkWithCredential(firebaseUser, credential);

                // Send email verification
                await sendEmailVerification(firebaseUser);

                // Upgrade anonymous user in backend
                const response = await upgradeAnonymous({
                    username: formData.username,
                    displayname: formData.displayName || formData.username,
                });

                if (response.ok) {
                    const data = await response.json();
                    updateUser({
                        new: false,
                        username: data.username || formData.username,
                        displayName: data.displayname || formData.displayName,
                        bio: data.bio || '',
                        pfp: data.pfp || ''
                    });
                    setShowConfirmationPopup(true);
                } else {
                    const errorData = await response.json();
                    setErrors({ global: errorData.message || 'Failed to upgrade account' });
                }
            } else {
                // Create new Firebase user
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );

                // Send email verification
                await sendEmailVerification(userCredential.user);

                // Register user with backend
                console.log('SignUp -> formData.displayName:', formData.displayName);
                console.log('SignUp -> sending to register:', {
                    username: formData.username,
                    displayname: formData.displayName || formData.username,
                });
                const response = await register({
                    username: formData.username,
                    displayname: formData.displayName || formData.username,
                    includeAnon: false,
                });

                if (response.ok) {
                    const data = await response.json();
                    updateUser({
                        new: false,
                        username: data.username || formData.username,
                        displayName: data.displayname || formData.displayName,
                        bio: data.bio || '',
                        pfp: data.pfp || ''
                    });
                    setShowConfirmationPopup(true);
                } else {
                    const errorData = await response.json();
                    setErrors({ global: errorData.message || 'Failed to create account' });
                }
            }
        } catch (error: unknown) {
            console.error('Signup error:', error);
            const firebaseError = error as { code?: string; message?: string };

            // Handle Firebase auth errors
            if (firebaseError.code === 'auth/email-already-in-use') {
                setErrors({ email: 'This email is already in use' });
            } else if (firebaseError.code === 'auth/invalid-email') {
                setErrors({ email: 'Invalid email address' });
            } else if (firebaseError.code === 'auth/weak-password') {
                setErrors({ password: 'Password is too weak' });
            } else if (firebaseError.code === 'auth/credential-already-in-use') {
                setErrors({ email: 'This email is already linked to another account' });
            } else {
                setErrors({ global: firebaseError.message || 'Something went wrong. Please try again.' });
            }
        }
    };

    const handlePopupResponse = async (choice: boolean) => {
        setIsLoading(true);
        setShowPopup(false);
        await processSignup(choice);
        setIsLoading(false);
    };

    const handleHidePopUp = async () => {
        setShowPopup(false);
        setIsLoading(false);
    }

    const onCloseConfirmation = () => {
        setShowConfirmationPopup(false);
        goBack();
    }

    const handleFocus = (isPassword: boolean | undefined, showRequirements: boolean | undefined) => {
        setErrors({});
        setIsPasswordActive((isPassword ? isPassword : false) && (showRequirements ? showRequirements : false));
        setIsLoading(false);
    };

    const handleGoToLogin = () => {
        navigate('/login', { state: { from: previousPage } });
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
                    <h2 className={styles.subTitle}>Sign Up</h2>
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
                    <FormsContainer onSubmit={handleSubmit} isLoading={isLoading} loadingButtonText={"Signing up..."} buttonText={"Sign Up"} password={formData.password} isPasswordActive={isPasswordActive}>
                        <FormItem
                            type="text"
                            id="username"
                            label="Username"
                            placeholder="Username"
                            required={true}
                            value={formData.username} // Pass value from parent state
                            onChange={handleChange}    // Use your existing handler
                            onFocus={handleFocus}
                            error={errors.username}
                        />
                        <FormItem
                            type="text"
                            id="displayName"
                            label="Display Name"
                            placeholder="Display Name"
                            value={formData.displayName}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            error={errors.displayName}
                        />
                        <FormItem
                            type="text"
                            id="email"
                            label="Email"
                            placeholder="Email"
                            required={true}
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            error={errors.email}
                        />
                        <FormItem
                            type="password"
                            id="password"
                            label="Password"
                            placeholder="Password"
                            required={true}
                            togglePassword={true}
                            showPasswordRequirements={true}
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={handleFocus} // Activate password requirements display
                            error={errors.password}
                            isPassword={true}
                        />
                    </FormsContainer>
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
            {(showConfirmationPopup &&
                <ConfirmationPopUp confirmation={"Success!"}
                    text={`We have sent an email to ${formData.email}. please follow the instructions to verify your email`}
                    success={true}
                    duration={10000}
                    onClose={onCloseConfirmation} />
            )}

        </div>
    );
};
