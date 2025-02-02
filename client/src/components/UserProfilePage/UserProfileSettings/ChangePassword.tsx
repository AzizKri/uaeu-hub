import React, {useState} from "react";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";

export default function ChangePassword({onClose, onSave, isLoading} : {onClose: () => void, onSave: (currPass : string, newPass : string) => string | undefined, isLoading : boolean}) {
    interface ChangePasswordErrors {
        global?: string;
        confirm?: string;
    }
    const [formData, setFormData] = useState({
        currPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<ChangePasswordErrors>({});
    const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (id === "confirmPassword" && value !== formData.newPassword) {
            setErrors({confirm : "Passwords do not match"});
        } else if (id === "newPasswordConfirm" && value === formData.newPassword) {
            setErrors({});
        }
    };
    const handleSave = () => {
        const error = onSave(formData.currPassword, formData.newPassword);
        setErrors({
            global: error,
            confirm: errors.confirm,
        });
        onClose();
    }

    const handleFocus = (isPassword: boolean | undefined, showRequirements : boolean | undefined) => {
        setErrors({
            global: undefined,
            confirm: errors.confirm,
        });
        setIsPasswordActive((isPassword ? isPassword : false) && (showRequirements ? showRequirements : false));
    };

    return (
        <>
            <FormsContainer onSubmit={handleSave} password={formData.newPassword} isPasswordActive={isPasswordActive} buttonText={"Save"} isLoading={isLoading} loadingButtonText={"Processing..."}>
                <FormItem
                    type={"password"}
                    id={"currPassword"}
                    label={"Current Password"}
                    isPassword={true}
                    togglePassword={true}
                    value={formData.currPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
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
