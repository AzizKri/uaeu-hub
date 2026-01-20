import { useState } from 'react';
import styles from './GoogleAuth.module.scss';
import googleGLogo from '../../../assets/logos/google-G-small.png';
import { auth, googleProvider, signInWithPopup } from '../../../firebase/config';
import { me, register, checkUsername } from '../../../api/authentication';
import { useUser } from "../../../contexts/user/UserContext.ts";
import Modal from '../../Reusable/Modal/Modal';
import FormItem from '../../Reusable/Forms/FormItem';

export default function GoogleAuth({
    setErrors,
    setIsLoading,
    onSubmit
}: {
    setErrors: (errors: LoginErrors) => void;
    setIsLoading: (isLoading: boolean) => void;
    onSubmit: () => void;
}) {
    const { updateUser } = useUser();
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [pendingUser, setPendingUser] = useState<{
        displayName: string;
        email: string;
        photoURL: string;
    } | null>(null);

    const handleGoogleLogin = async () => {
        setErrors({});
        setIsLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            console.log('Google sign-in successful:', user.email);

            // Try to get existing user data from backend
            const userData = await me();

            if (userData && userData.username && !userData.is_anonymous) {
                // Existing user with username - login successful
                updateUser({
                    new: false,
                    username: userData.username,
                    displayName: userData.displayname,
                    bio: userData.bio,
                    // Use backend pfp if available, otherwise use Firebase photo URL
                    pfp: userData.pfp || user.photoURL || ''
                });
                setIsLoading(false);
                onSubmit();
            } else {
                // New user via Google - need to collect username
                setPendingUser({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || ''
                });

                // Generate a suggested username from email
                const suggestedUsername = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, '') || '';
                setUsername(suggestedUsername);
                setShowUsernameModal(true);
                setIsLoading(false);
            }
        } catch (error: unknown) {
            console.error('Google sign-in error:', error);
            setIsLoading(false);

            const firebaseError = error as { code?: string };
            if (firebaseError.code === 'auth/popup-closed-by-user') {
                // User closed the popup, not an error
                return;
            } else if (firebaseError.code === 'auth/cancelled-popup-request') {
                // Another popup was opened
                return;
            } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
                setErrors({
                    global: 'An account already exists with this email using a different sign-in method.'
                });
            } else {
                setErrors({
                    global: 'Something went wrong. Please try again!'
                });
            }
        }
    };

    const handleUsernameSubmit = async () => {
        if (!username.trim()) {
            setUsernameError('Username is required');
            return;
        }

        // Validate username format
        if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
            setUsernameError('Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens');
            return;
        }

        setIsLoading(true);
        setUsernameError('');

        try {
            // Check if username is available
            const usernameCheck = await checkUsername(username);
            if (!usernameCheck.available) {
                setUsernameError(usernameCheck.message || 'Username is already taken');
                setIsLoading(false);
                return;
            }

            // Register with backend
            const response = await register({
                username: username,
                displayname: pendingUser?.displayName || username,
            });

            if (response.ok) {
                const data = await response.json();
                updateUser({
                    new: false,
                    username: data.username || username,
                    displayName: data.displayname || pendingUser?.displayName,
                    bio: data.bio || '',
                    pfp: data.pfp || pendingUser?.photoURL || ''
                });
                setShowUsernameModal(false);
                onSubmit();
            } else {
                const errorData = await response.json();
                setUsernameError(errorData.message || 'Failed to complete registration');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setUsernameError('Something went wrong. Please try again.');
        }
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        // Sign out the user since registration wasn't completed
        auth.signOut();
        setShowUsernameModal(false);
        setPendingUser(null);
        setUsername('');
        setUsernameError('');
    };

    return (
        <>
            <button onClick={handleGoogleLogin} className={styles.loginBtn} type="button">
                <img width="24" height="24" src={googleGLogo} alt="google logo" />
                Sign in with Google
            </button>

            {showUsernameModal && (
                <Modal onClose={handleCloseModal}>
                    <div className={styles.usernameModal}>
                        <h2>Choose a Username</h2>
                        <p>Welcome! Please choose a unique username to complete your registration.</p>

                        <FormItem
                            type="text"
                            id="google-username"
                            label="Username"
                            placeholder="Enter your username"
                            required={true}
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            onFocus={() => setUsernameError('')}
                            error={usernameError}
                        />

                        <div className={styles.modalButtons}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.submitBtn}
                                onClick={handleUsernameSubmit}
                            >
                                Complete Registration
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
