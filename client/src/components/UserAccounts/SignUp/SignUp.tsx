import React, { useState } from 'react';
import styles from '../Forms.module.scss';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {sendEmailVerification, signUp} from '../../../api/authentication.ts';
import {isAnon} from '../../../api/currentUser.ts';
import YesNoPopUp from "../../Reusable/YesNoPopUp/YesNoPopUp.tsx";
import {userSchema} from "../../../userSchema.ts";
import { z } from 'zod';
import GoogleAuth from "../GoogleAuth/GoogleAuth.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";

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
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const previousPage = location.state?.from;
    const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);


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
            goBack();
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
        setIsLoading(true);
        await processSignup(choice);
        setIsLoading(false);
    };

    const handleHidePopUp = async () => {
        setShowPopup(false);
        setIsLoading(false);
    }

    const handleFocus = (isPassword: boolean | undefined, showRequirements : boolean | undefined) => {
        setErrors({});
        setIsPasswordActive((isPassword ? isPassword : false) && (showRequirements ? showRequirements : false));
        setIsLoading(false);
    };

    const handleGoToLogin = () => {
        navigate('/login', {state: {from: previousPage}});
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
        </div>
    );
};

