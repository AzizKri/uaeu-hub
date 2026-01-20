import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    linkWithCredential,
    EmailAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    applyActionCode,
    verifyPasswordResetCode,
    confirmPasswordReset,
    User
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Export auth functions for use throughout the app
export {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    linkWithCredential,
    EmailAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    applyActionCode,
    verifyPasswordResetCode,
    confirmPasswordReset,
};

export type { User };

/**
 * Get the current user's ID token for API requests
 * @returns Promise<string | null> - The ID token or null if not authenticated
 */
export async function getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Error getting ID token:', error);
        return null;
    }
}

/**
 * Get the current user's ID token, forcing a refresh if needed
 * @returns Promise<string | null> - The ID token or null if not authenticated
 */
export async function getIdTokenForced(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        return await user.getIdToken(true);
    } catch (error) {
        console.error('Error getting ID token:', error);
        return null;
    }
}

/**
 * Reload the current user's data from Firebase and force token refresh
 * This is useful after email verification to sync the verified status
 * @returns Promise<boolean> - Whether the user's email is verified
 */
export async function reloadUserAndRefreshToken(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    
    try {
        // Reload user data from Firebase
        await user.reload();
        // Force token refresh to get updated claims
        await user.getIdToken(true);
        return user.emailVerified;
    } catch (error) {
        console.error('Error reloading user:', error);
        return false;
    }
}
