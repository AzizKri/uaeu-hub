import React, {useState} from "react";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";
import { changePassword } from "../../../api/authentication.ts";

interface ChangePasswordProps {
    onSuccess: () => void;
    onError: (message: string) => void;
}

export default function ChangePassword({ onSuccess, onError }: ChangePasswordProps) {
    interface ChangePasswordErrors {
        global?: string;
        confirm?: string;
        currPassword?: string;
    }
    const [formData, setFormData] = useState({
        currPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<ChangePasswordErrors>({});
    const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (id === "confirmPassword" && value !== formData.newPassword) {
            setErrors({confirm : "Passwords do not match"});
        } else if (id === "confirmPassword" && value === formData.newPassword) {
            setErrors({});
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ confirm: "Passwords do not match" });
            return;
        }

        // Validate current password is provided
        if (!formData.currPassword) {
            setErrors({ currPassword: "Current password is required" });
            return;
        }

        // Validate new password is provided
        if (!formData.newPassword) {
            setErrors({ global: "New password is required" });
            return;
        }

        setIsLoading(true);

        try {
            const response = await changePassword(formData.currPassword, formData.newPassword);
            if (!response.ok) {
                const data = await response.json();
                if (response.status === 401) {
                    setErrors({ currPassword: data.message || "Current password is incorrect" });
                } else {
                    onError(data.message || "An error occurred while changing your password");
                }
                setIsLoading(false);
                return;
            }

            setFormData({
                currPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            onSuccess();
        } catch (error: unknown) {
            const typedError = error as { message?: string };
            console.error('Password change error:', typedError);
            onError(typedError.message || "An error occurred while changing your password");
        }

        setIsLoading(false);
    };

    const handleFocus = (isPassword: boolean | undefined, showRequirements : boolean | undefined) => {
        setErrors({
            global: undefined,
            confirm: errors.confirm,
            currPassword: errors.currPassword,
        });
        setIsPasswordActive((isPassword ? isPassword : false) && (showRequirements ? showRequirements : false));
    };

    return (
        <>
            <FormsContainer onSubmit={handleSave} password={formData.newPassword} isPasswordActive={isPasswordActive} buttonText={"Save"} isLoading={isLoading} loadingButtonText={"Processing..."}>
                {errors.global && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {errors.global}
                    </p>
                )}
                <FormItem
                    type={"password"}
                    id={"currPassword"}
                    label={"Current Password"}
                    isPassword={true}
                    togglePassword={true}
                    value={formData.currPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    error={errors.currPassword}
                />
                <FormItem
                    type={"password"}
                    id={"newPassword"}
                    label={"New Password"}
                    isPassword={true}
                    togglePassword={true}
                    showPasswordRequirements={true}
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
                <FormItem
                    type={"password"}
                    id={"confirmPassword"}
                    label={"Confirm Password"}
                    isPassword={true}
                    togglePassword={true}
                    value={formData.confirmPassword}
                    error={errors.confirm}
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
            </FormsContainer>
        </>
    )
}
