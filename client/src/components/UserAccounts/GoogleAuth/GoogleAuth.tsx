import styles from './GoogleAuth.module.scss';
import googleGLogo from '../../../assets/logos/google-G-small.png';
import { useGoogleLogin } from '@react-oauth/google';
import { signInWithGoogle } from '../../../api/authentication.ts';
import { useUser } from '../../../lib/utils/hooks.ts';

export default function GoogleAuth({
                                       setErrors,
                                       setIsLoading,
                                       onSubmit
                                   }: {
    setErrors: (errors: LoginErrors) => void;
    setIsLoading: (isLoading: boolean) => void;
    onSubmit: () => void;
}) {
    const googleLogin = useGoogleLogin({
        onSuccess: (res) => handleGoogleLogin(res),
        onError: () => console.error('Login Failed'),
        flow: 'auth-code'
    });
    const { updateUser } = useUser();

    const handleGoogleLogin = async ({ code }: { code: string }) => {
        console.log('google response', code);
        setErrors({});
        setIsLoading(true);
        if (!code) {
            console.log('Error logging in with Google');
            return;
        }
        try {
            const { status, data } = await signInWithGoogle(
                code
            );
            // {username: string, displayname: string, bio: string, pfp: string}
            if (status === 200 || status === 201) {
                console.log('Log in success, status: ', status);
                updateUser({
                    new: false,
                    username: data.username,
                    displayName: data.displayname,
                    bio: data.bio,
                    pfp: data.pfp
                });
                onSubmit();
            } else {
                const newErrors: LoginErrors = {};
                if (status === 401) {
                    newErrors.global = 'Already logged in!';
                } else if (status === 409) {
                    newErrors.global =
                        'There\'s already an account associated with this email!';
                } else {
                    newErrors.global =
                        'Something went wrong. please try again!';
                }
                setErrors(newErrors);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button onClick={() => googleLogin()} className={styles.loginBtn}>
            <img width="24" height="24" src={googleGLogo} alt="google logo" />
            Sign in with Google
        </button>
    );
}
