import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    auth,
    applyActionCode,
    verifyPasswordResetCode,
    confirmPasswordReset,
} from '../../firebase/config';
import styles from '../UserAccounts/Forms.module.scss';
import verifyStyles from './EmailVerification/EmailVerification.module.scss';
import LoadingFallback from '../Reusable/LoadingFallback/LoadingFallback';
import FormsContainer from '../Reusable/Forms/FormsContainer';
import FormItem from '../Reusable/Forms/FormItem';
import ConfirmationPopUp from './ConfirmationPopUp/ConfirmationPopUp';
import successLogo from '../../assets/check-mark-svgrepo.svg';
import failedLogo from '../../assets/cross-mark-button-svgrepo.svg';

/**
 * Firebase Action Handler
 * 
 * This component handles Firebase email action links:
 * - Email verification (mode=verifyEmail)
 * - Password reset (mode=resetPassword)
 * - Email change/revert (mode=recoverEmail)
 * 
 * Firebase sends users here with query params: mode, oobCode, continueUrl, lang
 */
export default function FirebaseActionHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode'); // Firebase's out-of-band code
    const continueUrl = searchParams.get('continueUrl');
    
    // Render the appropriate handler based on mode
    if (!mode || !oobCode) {
        return (
            <div className={verifyStyles.emailVerificationContainer}>
                <div className={verifyStyles.emailVerified}>
                    <img src={failedLogo} className={verifyStyles.verificationIcon} alt="error" />
                    <h2>Invalid Link</h2>
                    <p>This link is invalid or has expired.</p>
                    <button onClick={() => navigate('/')}>Go to Home</button>
                </div>
            </div>
        );
    }
    
    switch (mode) {
        case 'verifyEmail':
            return <EmailVerificationHandler oobCode={oobCode} continueUrl={continueUrl} />;
        case 'resetPassword':
            return <PasswordResetHandler oobCode={oobCode} />;
        case 'recoverEmail':
            return <EmailRecoveryHandler oobCode={oobCode} />;
        default:
            return (
                <div className={verifyStyles.emailVerificationContainer}>
                    <div className={verifyStyles.emailVerified}>
                        <img src={failedLogo} className={verifyStyles.verificationIcon} alt="error" />
                        <h2>Unknown Action</h2>
                        <p>This action type is not supported.</p>
                        <button onClick={() => navigate('/')}>Go to Home</button>
                    </div>
                </div>
            );
    }
}

/**
 * Email Verification Handler
 */
function EmailVerificationHandler({ oobCode, continueUrl }: { oobCode: string; continueUrl: string | null }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        async function verifyEmail() {
            try {
                // Apply the email verification code
                await applyActionCode(auth, oobCode);
                
                // Reload the current user to update emailVerified status
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    // Force refresh the token to get updated claims
                    // The next API call will automatically sync email_verified with the backend
                    await auth.currentUser.getIdToken(true);
                }
                
                setStatus('success');
                setMessage('Your email has been successfully verified!');
            } catch (error: unknown) {
                setStatus('error');
                const firebaseError = error as { code?: string; message?: string };
                
                if (firebaseError.code === 'auth/expired-action-code') {
                    setMessage('This verification link has expired. Please request a new one.');
                } else if (firebaseError.code === 'auth/invalid-action-code') {
                    setMessage('This verification link is invalid or has already been used.');
                } else {
                    setMessage('Failed to verify email. Please try again.');
                }
            }
        }
        
        verifyEmail();
    }, [oobCode]);
    
    const handleContinue = () => {
        if (continueUrl) {
            window.location.href = continueUrl;
        } else {
            navigate('/');
        }
    };
    
    return (
        <div className={verifyStyles.emailVerificationContainer}>
            {status === 'loading' && <LoadingFallback />}
            {status === 'success' && (
                <div className={verifyStyles.emailVerified}>
                    <img src={successLogo} className={verifyStyles.verificationIcon} alt="success" />
                    <h2>Email Verified 🎉</h2>
                    <p>{message}</p>
                    <button onClick={handleContinue}>Continue</button>
                </div>
            )}
            {status === 'error' && (
                <div className={verifyStyles.emailVerified}>
                    <img src={failedLogo} className={verifyStyles.verificationIcon} alt="error" />
                    <h2>Verification Failed ❌</h2>
                    <p>{message}</p>
                    <button onClick={() => navigate('/')}>Go to Home</button>
                </div>
            )}
        </div>
    );
}

/**
 * Password Reset Handler
 */
function PasswordResetHandler({ oobCode }: { oobCode: string }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        newPassword: '',
        newPasswordConfirm: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ global?: string; confirm?: string }>({});
    const [isPasswordActive, setIsPasswordActive] = useState(false);
    
    // Verify the password reset code on mount
    useEffect(() => {
        async function verifyCode() {
            try {
                // Verify the code is valid and get the email
                const userEmail = await verifyPasswordResetCode(auth, oobCode);
                setEmail(userEmail);
                setStatus('ready');
            } catch (error: unknown) {
                setStatus('error');
                const firebaseError = error as { code?: string };
                
                if (firebaseError.code === 'auth/expired-action-code') {
                    setErrors({ global: 'This password reset link has expired. Please request a new one.' });
                } else if (firebaseError.code === 'auth/invalid-action-code') {
                    setErrors({ global: 'This password reset link is invalid or has already been used.' });
                } else {
                    setErrors({ global: 'Invalid reset link. Please request a new one.' });
                }
            }
        }
        
        verifyCode();
    }, [oobCode]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        
        if (id === 'newPasswordConfirm' && value !== formData.newPassword) {
            setErrors({ confirm: 'Passwords do not match' });
        } else if (id === 'newPasswordConfirm' && value === formData.newPassword) {
            setErrors({});
        }
    };
    
    const handleFocus = (isPassword?: boolean, showRequirements?: boolean) => {
        setErrors({ ...errors, global: undefined });
        setIsPasswordActive(!!(isPassword && showRequirements));
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.newPasswordConfirm) {
            setErrors({ confirm: 'Passwords do not match' });
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Confirm the password reset
            await confirmPasswordReset(auth, oobCode, formData.newPassword);
            setStatus('success');
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string };
            
            if (firebaseError.code === 'auth/weak-password') {
                setErrors({ global: 'Password is too weak. Please choose a stronger password.' });
            } else if (firebaseError.code === 'auth/expired-action-code') {
                setErrors({ global: 'This reset link has expired. Please request a new one.' });
            } else {
                setErrors({ global: 'Failed to reset password. Please try again.' });
            }
        }
        
        setIsLoading(false);
    };
    
    if (status === 'loading') {
        return (
            <div className={verifyStyles.emailVerificationContainer}>
                <LoadingFallback />
            </div>
        );
    }
    
    if (status === 'error') {
        return (
            <div className={verifyStyles.emailVerificationContainer}>
                <div className={verifyStyles.emailVerified}>
                    <img src={failedLogo} className={verifyStyles.verificationIcon} alt="error" />
                    <h2>Invalid Link</h2>
                    <p>{errors.global}</p>
                    <button onClick={() => navigate('/forgot-password')}>Request New Link</button>
                </div>
            </div>
        );
    }
    
    if (status === 'success') {
        return (
            <ConfirmationPopUp
                confirmation="Success!"
                text="Your password has been reset successfully!"
                success={true}
                onClose={() => navigate('/login')}
            />
        );
    }
    
    return (
        <div className={styles.formBody}>
            <div className={styles.formContainer}>
                <div className={styles.formBox}>
                    <h2 className={styles.subTitle}>Reset Password</h2>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        Resetting password for: <strong>{email}</strong>
                    </p>
                    <FormsContainer
                        onSubmit={handleSubmit}
                        loadingButtonText="Resetting..."
                        buttonText="Reset Password"
                        isPasswordActive={isPasswordActive}
                        isLoading={isLoading}
                        password={formData.newPassword}
                    >
                        {errors.global && (
                            <p className={styles.error}>{errors.global}</p>
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
                            onChange={handleChange}
                            onFocus={handleFocus}
                            isPassword={true}
                        />
                        <FormItem
                            type="password"
                            id="newPasswordConfirm"
                            label="Confirm Password"
                            placeholder="Confirm New Password"
                            required={true}
                            togglePassword={true}
                            value={formData.newPasswordConfirm}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            error={errors.confirm}
                            isPassword={true}
                        />
                    </FormsContainer>
                </div>
            </div>
        </div>
    );
}

/**
 * Email Recovery Handler (for reverting email change)
 */
function EmailRecoveryHandler({ oobCode }: { oobCode: string }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        async function recoverEmail() {
            try {
                await applyActionCode(auth, oobCode);
                setStatus('success');
                setMessage('Your email has been restored to the previous address.');
            } catch (error: unknown) {
                setStatus('error');
                const firebaseError = error as { code?: string };
                
                if (firebaseError.code === 'auth/expired-action-code') {
                    setMessage('This recovery link has expired.');
                } else {
                    setMessage('Failed to recover email. Please try again.');
                }
            }
        }
        
        recoverEmail();
    }, [oobCode]);
    
    return (
        <div className={verifyStyles.emailVerificationContainer}>
            {status === 'loading' && <LoadingFallback />}
            {status === 'success' && (
                <div className={verifyStyles.emailVerified}>
                    <img src={successLogo} className={verifyStyles.verificationIcon} alt="success" />
                    <h2>Email Recovered</h2>
                    <p>{message}</p>
                    <button onClick={() => navigate('/')}>Go to Home</button>
                </div>
            )}
            {status === 'error' && (
                <div className={verifyStyles.emailVerified}>
                    <img src={failedLogo} className={verifyStyles.verificationIcon} alt="error" />
                    <h2>Recovery Failed</h2>
                    <p>{message}</p>
                    <button onClick={() => navigate('/')}>Go to Home</button>
                </div>
            )}
        </div>
    );
}
