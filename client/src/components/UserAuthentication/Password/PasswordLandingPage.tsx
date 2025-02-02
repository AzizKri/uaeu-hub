import React, { useState } from 'react';
import styles from '../../UserAccounts/Forms.module.scss';
import {sendForgotPasswordEmail} from '../../../api/authentication.ts';
import {useNavigate} from 'react-router-dom';
import ConfirmationPopUp from "../ConfirmationPopUp/ConfirmationPopUp.tsx";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";

export default function PasswordLandingPage() {
    interface passwordLandingPageErrors {
        global?: string;
        email?: string;
    }
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [errors, setErrors] = useState<passwordLandingPageErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleFocus = () => {
        setErrors({});
    };

    const onClose = () => {
        setShowPopup(false);
        navigate('/login');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await sendForgotPasswordEmail(formData.email);
        if (response.status === 200) {
            setShowPopup(true);
        } else {
            const newErrors : passwordLandingPageErrors = {};
            if (response.status === 404) {
                newErrors.global = "User not found";
            } else if (response.status === 400) {
                newErrors.global = "Invalid Email Address";
            }else {
                newErrors.global = 'Something went wrong please try again';
            }
            setErrors(newErrors);
        }
        setIsLoading(false);
    };

    const goBack = () => {
        navigate('/login');
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
                    <h2 className={styles.subTitle}>Reset Password</h2>
                    <FormsContainer onSubmit={handleSubmit} isLoading={isLoading} buttonText={"Send Email"} loadingButtonText={"Sending..."}>
                        {errors.global && (
                            <p className={styles.error}>
                                {errors.global}
                            </p>
                        )}
                        <FormItem
                            type="text"
                            id="email"
                            label="Email"
                            placeholder="Email"
                            required={true}
                            value={formData.email} // Pass value from parent state
                            onChange={handleChange}    // Use your existing handler
                            onFocus={handleFocus}
                            error={errors.email}
                        />
                    </FormsContainer>
                </div>
            </div>

            {showPopup && (
                <ConfirmationPopUp confirmation={"Email Sent!"} text={"Follow the directions in the email to reset your password"} success={true} onClose={onClose} />
            )}
        </div>
    );
};

