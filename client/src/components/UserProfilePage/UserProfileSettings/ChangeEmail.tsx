import {useState} from "react";
import FormsContainer from "../../Reusable/Forms/FormsContainer.tsx";
import FormItem from "../../Reusable/Forms/FormItem.tsx";
import { changeEmail } from "../../../api/authentication.ts";

interface ChangeEmailProps {
    currentEmail: string;
    onSuccess: () => void;
    onError: (message: string) => void;
}

export default function ChangeEmail({ currentEmail, onSuccess, onError }: ChangeEmailProps) {
    const [formData, setFormData] = useState({
        newEmail: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({});

        if (!formData.newEmail) {
            setErrors({ email: "New email is required" });
            return;
        }

        if (!formData.password) {
            setErrors({ password: "Password is required" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await changeEmail(formData.newEmail, formData.password);
            if (response.ok) {
                onSuccess();
            } else {
                const data = await response.json();
                setErrors({ global: data.message || "Unable to change email" });
            }
        } catch (error: unknown) {
            const typedError = error as { message?: string };
            onError(typedError.message || "Unable to change email");
        }
        setIsLoading(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    };

    return (
        <FormsContainer onSubmit={handleSave} buttonText={"Save"} isLoading={isLoading} loadingButtonText={"Saving..."}>
            {errors.global && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {errors.global}
                </p>
            )}
            <FormItem type={"text"} id={"currentEmail"} label={"Current Email"} value={currentEmail} disabled={true} />
            <FormItem
                type={"text"}
                id={"newEmail"}
                label={"New Email"}
                value={formData.newEmail}
                onChange={handleChange}
                error={errors.email}
            />
            <FormItem
                type={"password"}
                id={"password"}
                label={"Password"}
                isPassword={true}
                togglePassword={true}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
            />
        </FormsContainer>
    )
}
