import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { getSignedCookie } from 'hono/cookie';
import { anonSignup } from '../controllers/auth.controller';
import { getUserFromSessionKey, sendAuthCookie, sendUserIdCookie } from '../util/util';
import { createRemoteJWKSet, JWTPayload, jwtVerify } from 'jose';
import { createPublicId } from '../util/nanoid';

/**
 * @sets `{ userId, isAnonymous }` on the context ONLY IF there is a valid user
 */
export const authMiddlewareCheckOnly = createMiddleware(
    async (c: Context, next) => {
        console.log('AUTH MIDDLEWARE CHECK ONLY');

        // Check if the user is authenticated without creating a new anon user
        await sharedAuthMiddleware(c, true);

        // Authentication done, go to next middleware/controller
        await next();
    }
);

/**
 * @sets `{ userId, isAnonymous }` on the context
 *
 * @creates a new anonymous user if the user is not authenticated
 */
export const authMiddleware = createMiddleware(
    async (c: Context, next) => {
        console.log('AUTH MIDDLEWARE');

        // Check if the user is authenticated, create a new anon user if invalid
        await sharedAuthMiddleware(c, false);

        // Authentication done, go to next middleware/controller
        await next();
    }
);

async function sharedAuthMiddleware(c: Context, checkOnly: boolean) {
    // Begin with checking the session key before token. No token without key
    const sessionKey = await getSignedCookie(c, c.env.EN_SECRET, 'sessionKey') as string;

    console.log('authMiddleware -> sessionKey', sessionKey);

    if (!sessionKey) {
        console.log('authMiddleware -> No session key');

        // No session key, first interaction. Do we want to check only?
        if (checkOnly) return;

        // Sign up as anonymous
        const userId = await anonSignup(c, true) as number;

        c.set('userId', userId);
        c.set('isAnonymous', true);
    } else {
        console.log('authMiddleware -> sessionKey');

        // There is a session key, check if there's a valid token
        const sessionToken = await getSignedCookie(c, c.env.EN_SECRET, 'sessionToken') as string;

        console.log('authMiddleware -> sessionKey -> sessionToken', sessionToken);

        if (sessionToken) {
            console.log('authMiddleware -> sessionKey -> sessionToken');

            const [userIdStr, isAnonymousStr] = sessionToken.split(':');
            const userId = Number(userIdStr);
            const isAnonymous = Number(isAnonymousStr);

            console.log('authMiddleware -> sessionKey -> sessionToken -> userId', userId);
            console.log('authMiddleware -> sessionKey -> sessionToken -> isAnonymous', isAnonymous);

            // If the user ID is not a number, then it's an invalid token
            if (isNaN(userId) || isNaN(isAnonymous)) {
                console.log('authMiddleware -> sessionKey -> sessionToken -> Invalid token');
                // Do we want to check only?
                if (checkOnly) return;
                // Invalid token, sign up as anonymous
                await anonSignup(c);
            } else {
                console.log('authMiddleware -> sessionKey -> sessionToken -> Valid token');
                // Both are valid, send em
                c.set('userId', userId);
                c.set('isAnonymous', isAnonymous == 1);
            }
        } else {
            // Existing user. Is the user valid?
            const userFromSessionKey = await getUserFromSessionKey(c, sessionKey);

            if (!userFromSessionKey) {
                // Do we want to check only?
                if (checkOnly) return;
                // Invalid user, sign up as anonymous
                const userId = await anonSignup(c, true) as number;
                c.set('userId', userId);
                c.set('isAnonymous', true);
            } else {
                // Valid user, send auth cookie
                await sendAuthCookie(c, sessionKey);
                await sendUserIdCookie(c, userFromSessionKey.userId.toString(), userFromSessionKey.isAnonymous);
                c.set('userId', userFromSessionKey.userId);
                c.set('isAnonymous', userFromSessionKey.isAnonymous);
            }
        }

    }
}


/**
 * Firebase authentication middleware
 * @sets `{ userId, isAnonymous, firebaseClaims }` on the context
 * @creates or updates user based on Firebase token claims
 * @fallback creates anonymous user if no valid token
 */
export const firebaseAuthMiddleware = createMiddleware(
    async (c: Context, next) => {
        console.log('FIREBASE AUTH MIDDLEWARE');

        const header = c.req.header('authorization') || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token) {
            console.log('firebaseAuthMiddleware -> No token, creating anon user');
            // No token, create anonymous user
            const userId = await anonSignup(c, true) as number;
            c.set('userId', userId);
            c.set('isAnonymous', true);
            await next();
            return;
        }

        const projectId = c.env?.FIREBASE_PROJECT_ID;
        if (!projectId) {
            console.error('firebaseAuthMiddleware -> FIREBASE_PROJECT_ID not configured');
            // Server misconfigured, fall back to anon
            const userId = await anonSignup(c, true) as number;
            c.set('userId', userId);
            c.set('isAnonymous', true);
            await next();
            return;
        }

        try {
            const claims = await verifyFirebaseIdToken(token, projectId);
            console.log('firebaseAuthMiddleware -> Valid token for user:', claims.user_id);

            // Upsert user and get their internal user ID
            // Note: upsertFirebaseUser also sets 'isAnonymous' in context based on DB value
            const userId = await upsertFirebaseUser(c, claims);

            c.set('userId', userId);
            c.set('firebaseClaims', claims);

            await next();
        } catch (e) {
            console.log('firebaseAuthMiddleware -> Invalid token:', e);
            // Invalid token, create anonymous user
            const userId = await anonSignup(c, true) as number;
            c.set('userId', userId);
            c.set('isAnonymous', true);
            await next();
        }
    }
);

/**
 * Firebase authentication middleware - check only
 * @sets `{ userId, isAnonymous, firebaseClaims }` on the context ONLY IF there is a valid token
 * Does NOT create anonymous user if token is missing/invalid
 */
export const firebaseAuthMiddlewareCheckOnly = createMiddleware(
    async (c: Context, next) => {
        console.log('FIREBASE AUTH MIDDLEWARE CHECK ONLY');

        const header = c.req.header('authorization') || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token) {
            console.log('firebaseAuthMiddlewareCheckOnly -> No token');
            await next();
            return;
        }

        const projectId = c.env?.FIREBASE_PROJECT_ID;
        if (!projectId) {
            console.error('firebaseAuthMiddlewareCheckOnly -> FIREBASE_PROJECT_ID not configured');
            await next();
            return;
        }

        try {
            const claims = await verifyFirebaseIdToken(token, projectId);
            console.log('firebaseAuthMiddlewareCheckOnly -> Valid token for user:', claims.user_id);

            // Upsert user and get their internal user ID
            // Note: upsertFirebaseUser also sets 'isAnonymous' in context based on DB value
            const userId = await upsertFirebaseUser(c, claims);

            c.set('userId', userId);
            c.set('firebaseClaims', claims);
        } catch (e) {
            console.log('firebaseAuthMiddlewareCheckOnly -> Invalid token:', e);
        }

        await next();
    }
);

// HELPERS


/**
 * Upserts a Firebase user into the database
 * @returns the internal user ID (auto-incremented integer)
 */
async function upsertFirebaseUser(c: Context, claims: FirebaseClaims): Promise<number> {
    const firebaseUid = claims.user_id || claims.sub;
    const email = claims.email ?? null;
    const emailVerified = claims.email_verified ? 1 : 0;
    const displayName = claims.name ?? null;
    const photoUrl = claims.picture ?? null;
    const authProvider = claims.firebase?.sign_in_provider || 'firebase';
    const now = Math.floor(Date.now() / 1000);
    
    // Check if this is a Firebase anonymous user
    const isAnonymous = authProvider === 'anonymous' ? 1 : 0;

    console.log('upsertFirebaseUser -> claims.picture:', photoUrl, 'provider:', authProvider, 'isAnonymous:', isAnonymous, 'emailVerified:', emailVerified);

    // Generate a username from email or Firebase UID
    const username = email ? email.split('@')[0] : `user_${firebaseUid.substring(0, 8)}`;

    // Generate public_id for the user
    const publicId = createPublicId();

    try {
        // Try to insert or update user
        // Note: We DON'T update is_anonymous or displayname here - those are handled by registerUser/upgradeAnonymous
        const result = await c.env.DB.prepare(
            `INSERT INTO user (
                firebase_uid, username, displayname, email, email_verified,
                auth_provider, pfp, created_at, is_anonymous, public_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(firebase_uid) DO UPDATE SET
                email = COALESCE(excluded.email, user.email),
                email_verified = excluded.email_verified,
                pfp = COALESCE(excluded.pfp, user.pfp),
                auth_provider = excluded.auth_provider
            RETURNING id, is_anonymous`
        ).bind(
            firebaseUid, username, displayName || username, email, emailVerified,
            authProvider, photoUrl, now, isAnonymous, publicId
        ).first() as { id: number; is_anonymous: number } | null;

        if (!result) {
            throw new Error('Failed to upsert Firebase user');
        }

        console.log('upsertFirebaseUser -> User ID:', result.id, 'isAnonymous:', result.is_anonymous);
        
        // Set the isAnonymous flag in the context
        c.set('isAnonymous', result.is_anonymous === 1);
        
        // Add user to general community (id=0) if not already a member
        await addUserToGeneralCommunity(c, result.id);
        
        return result.id;
    } catch (e) {
        console.error('upsertFirebaseUser -> Error:', e);

        // If email constraint fails, try without email
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed: user.email')) {
            console.log('upsertFirebaseUser -> Email conflict, retrying without email');
            const result = await c.env.DB.prepare(
                `INSERT INTO user (
                    firebase_uid, username, displayname, email_verified,
                    auth_provider, pfp, created_at, is_anonymous, public_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(firebase_uid) DO UPDATE SET
                    email_verified = excluded.email_verified,
                    pfp = COALESCE(excluded.pfp, user.pfp),
                    auth_provider = excluded.auth_provider
                RETURNING id, is_anonymous`
            ).bind(
                firebaseUid, username, displayName || username, emailVerified,
                authProvider, photoUrl, now, isAnonymous, publicId
            ).first() as { id: number; is_anonymous: number } | null;

            if (!result) {
                throw new Error('Failed to upsert Firebase user without email');
            }

            c.set('isAnonymous', result.is_anonymous === 1);
            await addUserToGeneralCommunity(c, result.id);
            return result.id;
        }

        // If username constraint fails, try with a unique username
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed: user.username')) {
            console.log('upsertFirebaseUser -> Username conflict, generating unique username');
            const uniqueUsername = `${username}_${firebaseUid.substring(0, 8)}`;

            const result = await c.env.DB.prepare(
                `INSERT INTO user (
                    firebase_uid, username, displayname, email, email_verified,
                    auth_provider, pfp, created_at, is_anonymous, public_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(firebase_uid) DO UPDATE SET
                    email = COALESCE(excluded.email, user.email),
                    email_verified = excluded.email_verified,
                    pfp = COALESCE(excluded.pfp, user.pfp),
                    auth_provider = excluded.auth_provider
                RETURNING id, is_anonymous`
            ).bind(
                firebaseUid, uniqueUsername, displayName || uniqueUsername, email, emailVerified,
                authProvider, photoUrl, now, isAnonymous, publicId
            ).first() as { id: number; is_anonymous: number } | null;

            if (!result) {
                throw new Error('Failed to upsert Firebase user with unique username');
            }

            c.set('isAnonymous', result.is_anonymous === 1);
            await addUserToGeneralCommunity(c, result.id);
            return result.id;
        }

        throw e;
    }
}

/**
 * Add user to the general community (id=0) if not already a member
 */
async function addUserToGeneralCommunity(c: Context, userId: number): Promise<void> {
    try {
        await c.env.DB.prepare(`
            INSERT OR IGNORE INTO user_community (user_id, community_id, role_id)
            VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
        `).bind(userId).run();
    } catch (e) {
        // Log but don't fail - community membership is not critical for auth
        console.error('addUserToGeneralCommunity -> Error:', e);
    }
}

const GOOGLE_JWKS_URL =
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

async function verifyFirebaseIdToken(
    token: string,
    projectId: string
): Promise<FirebaseClaims> {
    const { payload } = await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
    });
    return payload as FirebaseClaims;
}

interface FirebaseClaims extends JWTPayload {
    /** Firebase project ID (audience) */
    aud: string
    /** Issuer, e.g. https://securetoken.google.com/<PROJECT_ID> */
    iss: string
    /** UID of the user (same as user_id) */
    sub: string
    /** UID duplicate for convenience */
    user_id: string

    /** User's email address (may be null or absent) */
    email?: string
    /** True if the email is verified */
    email_verified?: boolean

    /** User display name (profile.name) */
    name?: string
    /** User profile photo URL */
    picture?: string

    /** Time of authentication in seconds since epoch */
    auth_time?: number

    /** Firebase-specific metadata object */
    firebase?: {
        /** e.g. "password", "google.com", "phone", etc. */
        sign_in_provider?: string
        /** Tenant ID if using multi-tenancy */
        tenant?: string
        /** Other keys Firebase may add in the future */
        [key: string]: unknown
    }
}
