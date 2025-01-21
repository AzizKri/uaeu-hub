import styles from "./GoogleAuth.module.scss";
import googleGLogo from "../../../assets/logos/google-G-small.png";
import {CredentialResponse, TokenResponse, useGoogleLogin} from "@react-oauth/google";
import {signInWithGoogle} from "../../../api/authentication.ts";
import {useNavigate} from "react-router-dom";
import {useUser} from "../../../lib/utils/hooks.ts";

export default function GoogleAuth({setErrors, setIsLoading}: {setErrors: (errors: LoginErrors) => void, setIsLoading: (isLoading: boolean) => void}) {
    const googleLogin = useGoogleLogin({
        onSuccess: (res) => handleGoogleLogin(res),
        onError: () => console.error('Login Failed'),
    });
    const navigate = useNavigate();
    const {updateUser} = useUser();

    const handleGoogleLogin = (
        response: Omit<
            TokenResponse,
            "error" | "error_description" | "error_uri"
        > | CredentialResponse,
    ) => {
        setErrors({});
        setIsLoading(true);
        if ("credential" in response && !response.credential) return;

        if (response && "credential" in response && response.credential) signInWithGoogle(response.credential).then(async (res) => {
            if (res.status === 200 || res.status === 201) {
                const data = await res.json();
                console.log("Log in success:", res);
                updateUser({
                    new: false,
                    username: data.username,
                    displayName: data.displayName,
                    bio: data.bio,
                    pfp: data.pfp,
                });
                navigate(-1);
            } else {
                const newErrors: LoginErrors = {};
                if (res.status === 401) {
                    newErrors.global = "Already logged in!";
                } else if (res.status === 409) {
                    newErrors.global =
                        "There's already an account associated with this email!";
                } else {
                    newErrors.global =
                        "Something went wrong. please try again!";
                }
                setErrors(newErrors);
            }
            setIsLoading(false);
        });
    };

    return (
        <button
            onClick={() => googleLogin()}
            className={styles.loginBtn}
        >
            <img width="24" height="24" src={googleGLogo} alt="google logo"/>
            Sign in with Google
        </button>
    )
}
