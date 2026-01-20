import { getIdToken } from '../firebase/config';

const base = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/auth';

/**
 * Helper to get authorization headers with Firebase ID token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getIdToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Get current user data from backend
 * Uses Firebase ID token for authentication
 */
export async function me() {
    console.log("me");
    const headers = await getAuthHeaders();
    const request = await fetch(base + `/me`, { headers });
    const data = await request.json();
    return data.user;
}

/**
 * Sync email verification status from Firebase to backend database
 * Call this after verifying email to update the database
 */
export async function syncEmailVerified(): Promise<{ email_verified: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(base + `/sync-email-verified`, {
        method: 'POST',
        headers,
    });
    return await response.json();
}

/**
 * Check if a username is available
 * @param username - The username to check
 * @returns Promise<{ available: boolean, message?: string }>
 */
export async function checkUsername(username: string): Promise<{ available: boolean; message?: string }> {
    const response = await fetch(base + `/check-username?username=${encodeURIComponent(username)}`);
    return await response.json();
}

/**
 * Look up email for a given username (for login with username)
 * @param username - The username to look up
 * @returns Promise<{ email: string } | { error: string }>
 */
export async function lookupEmail(username: string): Promise<{ email?: string; error?: string }> {
    const response = await fetch(base + `/lookup-email?username=${encodeURIComponent(username)}`);
    return await response.json();
}

/**
 * Register a new user after Firebase authentication
 * Links Firebase UID with username and display name in backend
 * @param data - Registration data including username, displayname, and optional includeAnon flag
 */
export async function register(data: { 
    username: string; 
    displayname: string; 
    includeAnon?: boolean;
}): Promise<Response> {
    const headers = await getAuthHeaders();
    return await fetch(base + `/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
}

/**
 * Check if the current user is anonymous
 * @returns Promise<boolean>
 */
export async function isAnon(): Promise<boolean> {
    const headers = await getAuthHeaders();
    const response = await fetch(base + `/isAnon`, { headers });
    const data = await response.json();
    return data.anon === true;
}

/**
 * Check if there's an authenticated user
 * @returns Promise<boolean>
 */
export async function isUser(): Promise<boolean> {
    const headers = await getAuthHeaders();
    const response = await fetch(base + `/isUser`, { headers });
    const data = await response.json();
    return data.user === true;
}

/**
 * Upgrade an anonymous user to a registered user
 * Transfers anonymous data (posts, comments, etc.) to the new account
 * @param data - Registration data for the upgrade
 */
export async function upgradeAnonymous(data: {
    username: string;
    displayname: string;
}): Promise<Response> {
    const headers = await getAuthHeaders();
    return await fetch(base + `/upgrade-anonymous`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
}

/**
 * Sign out - clears any server-side state if needed
 * Note: Firebase sign out should be called separately on the client
 */
export async function logout(): Promise<number> {
    const headers = await getAuthHeaders();
    const response = await fetch(base + `/logout`, { 
        method: 'POST',
        headers 
    });
    return response.status;
}

// ============================================
// DEPRECATED - Firebase handles these now
// Kept for reference during migration
// ============================================

/**
 * @deprecated Use Firebase sendEmailVerification instead
 */
export async function sendEmailVerification() {
    console.warn('sendEmailVerification is deprecated - use Firebase sendEmailVerification');
    const headers = await getAuthHeaders();
    return await fetch(base + `/sendEmailVerification`, { method: 'POST', headers });
}

/**
 * @deprecated Use Firebase sendPasswordResetEmail instead
 */
export async function sendForgotPasswordEmail(email: string) {
    console.warn('sendForgotPasswordEmail is deprecated - use Firebase sendPasswordResetEmail');
    return await fetch(base + `/forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
}

/**
 * @deprecated Firebase handles password reset
 */
export async function resetPassword(token: string, password: string) {
    console.warn('resetPassword is deprecated - use Firebase password reset');
    return await fetch(base + `/resetPassword?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
    });
}

/**
 * @deprecated Firebase handles password changes
 */
export async function changePassword(currentPassword: string, newPassword: string) {
    console.warn('changePassword is deprecated - use Firebase updatePassword');
    const headers = await getAuthHeaders();
    return await fetch(base + `/changePassword`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

/**
 * @deprecated Firebase handles email changes
 */
export async function changeEmail(email: string, password: string) {
    console.warn('changeEmail is deprecated - use Firebase updateEmail');
    const headers = await getAuthHeaders();
    return await fetch(base + `/changeEmail`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
    });
}

// ============================================
// REMOVED - Old cookie-based auth functions
// ============================================

// signUp - now handled by Firebase createUserWithEmailAndPassword + register()
// login - now handled by Firebase signInWithEmailAndPassword
// signInWithGoogle - now handled by Firebase signInWithPopup
// verifyEmail - now handled by Firebase
