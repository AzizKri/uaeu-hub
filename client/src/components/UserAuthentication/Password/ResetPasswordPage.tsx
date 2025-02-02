import React, {useEffect, useState} from 'react';
import styles from '../../UserAccounts/Forms.module.scss';
import {resetPassword} from '../../../api/authentication.ts';
import {useNavigate, useSearchParams} from 'react-router-dom';
import ConfirmationPopUp from "../ConfirmationPopUp/ConfirmationPopUp.tsx";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";

export default function ResetPasswordPage() {
    interface ResetPasswordPageErrors {
        global?: string;
        confirm?: string;
    }
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        newPassword: '',
        newPasswordConfirm: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [errors, setErrors] = useState<ResetPasswordPageErrors>({});
    const [success, setSuccess] = useState(true);
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);

    useEffect(() => {
        if (!token) {
            setShowPopup(true);
            setSuccess(false);
            setErrors({global : "Invalid token"});
            return;
        }
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === "newPasswordConfirm" && value !== formData.newPassword) {
            setErrors({confirm : "Passwords do not match"});
        } else if (id === "newPasswordConfirm" && value === formData.newPassword) {
            setErrors({});
        }
    };

    const handleFocus = (isPassword: boolean | undefined, showRequirements : boolean | undefined) => {
        setErrors({
            global: undefined,
            confirm: errors.confirm,
        });
        setIsPasswordActive((isPassword ? isPassword : false) && (showRequirements ? showRequirements : false));
    };

    const onClose = () => {
        setShowPopup(false);
        navigate('/login');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await resetPassword(token!, formData.newPassword);
        if (response.status === 200) {
            setShowPopup(true);
            setSuccess(true);
        } else {
            const newErrors : ResetPasswordPageErrors = {};
            const data = await response.json();
            newErrors.global = data.message;
            setErrors(newErrors);
            setShowPopup(true);
            setShowPopup(false);
        }
        setIsLoading(false);
        navigate('/login');
    };



    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <h2 className={styles.subTitle}>Reset Password</h2>
                    <FormsContainer onSubmit={handleSubmit}>
                        {errors.global && (
                            <p className={styles.error}>
                                {errors.global}
                            </p>
                        )}
                        <FormItem
                            type="password"
                            id="newPassword"
                            label="New Password"
                            placeholder="Password"
                            required={true}
                            togglePassword={true}
                            showPasswordRequirements={true}
                            value={formData.newPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>)=> {
                                setFormData({ ...formData, [e.target.id]: e.target.value });
                                handleChange(e);
                            }}
                            onFocus={handleFocus} // Activate password requirements display
                            isPasswordActive={isPasswordActive}
                            isPassword={true}
                        />
                        <FormItem
                            type="password"
                            id="newPasswordConfirm"
                            label="Confirm Password"
                            placeholder="Confrim New Password"
                            required={true}
                            togglePassword={true}
                            value={formData.newPasswordConfirm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>)=> {
                                setFormData({ ...formData, [e.target.id]: e.target.value });
                                handleChange(e);
                            }}
                            onFocus={handleFocus} // Activate password requirements display
                            error={errors.confirm}
                            isPassword={true}
                        />
                        <button
                            type="submit"
                            className={styles.formBtn}
                            disabled={isLoading || (typeof errors.confirm === "string")}
                        >
                            {isLoading ? "Loading..." : "Reset Password"}
                        </button>
                    </FormsContainer>
                </div>
            </div>

            {(showPopup && (success ? (
                <ConfirmationPopUp confirmation={"Success!"}
                                   text={"Your password has been reset successfully!"}
                                   success={true}
                                   onClose={onClose}/>
            ) : (<ConfirmationPopUp confirmation={"Something Went Wrong"}
                                    text={errors.global ? errors.global.concat(" please try again") : ""}
                                    success={false} onClose={onClose}/>)))}

        </div>
    );
};

