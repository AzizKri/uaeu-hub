import React, { useState } from 'react';
import styles from '../Forms.module.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { checkUsername, isAnon, signup } from '../../../api/authentication';
import YesNoPopUp from "../../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import { userSchema } from "../../../userSchema.ts";
import { z } from 'zod';
import { useUser } from "../../../contexts/user/UserContext.ts";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";
import ConfirmationPopUp from "../../UserAuthentication/ConfirmationPopUp/ConfirmationPopUp.tsx";
import { mapBackendUserToUserInfo } from "../../../contexts/user/mapBackendUser.ts";
import { getRequestFailureMessage, getResponseErrorMessage } from "../../../api/errors.ts";

export default function SignUp() {
    const navigate = useNavigate();
    const { updateUser } = useUser();

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

            if (await isAnon()) {
                setShowPopup(true);
            } else {
                await processSignup(false);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setErrors({
                global: getRequestFailureMessage(
                    'check username availability',
                    error,
                ),
            });
        }
        setIsLoading(false);
    };

    const processSignup = async (includeAnon: boolean) => {
        try {
            const response = await signup({
                username: formData.username,
                displayname: formData.displayName || formData.username,
                email: formData.email,
                password: formData.password,
                includeAnon,
            });

            if (response.ok) {
                const data = await response.json();
                if (!data.user) {
                    setErrors({
                        global:
                            'Account was created, but the server did not return your profile. Please log in.',
                    });
                    return;
                }
                updateUser(mapBackendUserToUserInfo(data.user));
                setShowConfirmationPopup(true);
            } else {
                setErrors({
                    global: await getResponseErrorMessage(
                        response,
                        'Could not create account. Please review the form and try again.',
                    ),
                });
            }
        } catch (error: unknown) {
            console.error('Signup error:', error);
            setErrors({
                global: getRequestFailureMessage('create account', error),
            });
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
