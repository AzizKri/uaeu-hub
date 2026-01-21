import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly } from '../middleware';
import {
    checkUsername,
    lookupEmail,
    registerUser,
    upgradeAnonymous,
    authenticateUserFirebase,
    isUserFirebase,
    isAnonFirebase,
    logoutFirebase,
    checkAdminEmail,
} from '../controllers/firebase-auth.controller';

const app = new Hono<{ Bindings: Env }>();

// ============================================
// Firebase Authentication Routes
// ============================================

// Username and email utilities (no auth required)
app.get('/check-username', (c: Context) => checkUsername(c));
app.get('/lookup-email', (c: Context) => lookupEmail(c));

// Admin check (no auth required - used before login)
app.post('/check-admin', (c: Context) => checkAdminEmail(c));

// Registration - requires Firebase auth
app.post('/register', firebaseAuthMiddleware, (c: Context) => registerUser(c));
app.post('/upgrade-anonymous', firebaseAuthMiddleware, (c: Context) => upgradeAnonymous(c));

// User data - uses Firebase auth
app.get('/me', firebaseAuthMiddlewareCheckOnly, (c: Context) => authenticateUserFirebase(c));
app.get('/isUser', firebaseAuthMiddlewareCheckOnly, (c: Context) => isUserFirebase(c));
app.get('/isAnon', firebaseAuthMiddlewareCheckOnly, (c: Context) => isAnonFirebase(c));

// Sync email verification status from Firebase token to database
app.post('/sync-email-verified', firebaseAuthMiddleware, async (c: Context) => {
    const userId = c.get('userId') as number | undefined;
    const firebaseClaims = c.get('firebaseClaims') as { email_verified?: boolean } | undefined;
    
    if (!userId || !firebaseClaims) {
        return c.json({ message: 'Not authenticated' }, 401);
    }
    
    const emailVerified = firebaseClaims.email_verified ? 1 : 0;
    console.log('sync-email-verified -> userId:', userId, 'emailVerified from token:', emailVerified);
    
    try {
        await c.env.DB.prepare(`
            UPDATE user SET email_verified = ? WHERE id = ?
        `).bind(emailVerified, userId).run();
        
        const user = await c.env.DB.prepare(`
            SELECT id, email, email_verified FROM user WHERE id = ?
        `).bind(userId).first();
        
        console.log('sync-email-verified -> after update:', user);
        
        return c.json({ 
            message: 'Email verification status synced',
            email_verified: emailVerified === 1,
            user
        }, 200);
    } catch (e) {
        console.error('sync-email-verified error:', e);
        return c.json({ message: 'Failed to sync' }, 500);
    }
});

// Logout
app.post('/logout', (c: Context) => logoutFirebase(c));

// ============================================
// Deprecated Routes (kept for backward compatibility)
// These will be removed in a future version
// ============================================

// Email verification - now handled by Firebase
app.post('/sendEmailVerification', firebaseAuthMiddlewareCheckOnly, (c: Context) => {
    return c.json({ message: 'Email verification is now handled by Firebase' }, 200);
});

app.get('/verifyEmail', (c: Context) => {
    return c.json({ message: 'Email verification is now handled by Firebase' }, 200);
});

// Password reset - now handled by Firebase
app.post('/forgotPassword', (c: Context) => {
    return c.json({ message: 'Password reset is now handled by Firebase' }, 200);
});

app.post('/resetPassword', (c: Context) => {
    return c.json({ message: 'Password reset is now handled by Firebase' }, 200);
});

app.post('/changePassword', firebaseAuthMiddlewareCheckOnly, (c: Context) => {
    return c.json({ message: 'Password change is now handled by Firebase' }, 200);
});

app.post('/changeEmail', firebaseAuthMiddlewareCheckOnly, (c: Context) => {
    return c.json({ message: 'Email change is now handled by Firebase' }, 200);
});

export default app;
