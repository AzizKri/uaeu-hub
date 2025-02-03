import React, { useState } from 'react';
import styles from '../Forms.module.scss';
import { login} from '../../../api/authentication.ts';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GoogleAuth from "../GoogleAuth/GoogleAuth.tsx";
import {useUser} from "../../../contexts/user/UserContext.ts";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";

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
            if (previousPage === "/login"){
                navigate("/")
            }
            else{
                navigate(previousPage);
            }
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
                    <GoogleAuth setErrors={setErrors} setIsLoading={setIsLoading} onSubmit={() => navigate(previousPage)}/>
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {setFormData({ ...formData, [e.target.id]: e.target.value.toLowerCase() })}}    // Use your existing handler
                            onFocus={handleFocus}
                            error={errors.identifier}
                        />
                        <FormItem
                            type="password"
                            id="password"
                            label="Password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {setFormData({ ...formData, [e.target.id]: e.target.value})}}
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

