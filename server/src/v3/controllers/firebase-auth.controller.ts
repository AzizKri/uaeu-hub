import { Context } from 'hono';
import { isUsernameValid } from '../util/validationSchemas';

/**
 * Firebase Authentication Controller
 * Handles Firebase-based authentication flows
 */

/**
 * Check if a username is available
 * GET /auth/check-username?username=xxx
 */
export async function checkUsername(c: Context) {
    const env: Env = c.env;
    const username = c.req.query('username');

    if (!username) {
        return c.json({ available: false, message: 'Username is required' }, 400);
    }

    // Validate username format
    if (!/^[a-z0-9._-]{3,20}$/i.test(username)) {
        return c.json({
            available: false,
            message: 'Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens'
        }, 400);
    }

    // Check if username is reserved
    if (!isUsernameValid(username)) {
        return c.json({ available: false, message: 'Username is reserved' }, 400);
    }

    // Check if username exists in database
    const existingUser = await env.DB.prepare(`
        SELECT id FROM user WHERE username = ? COLLATE NOCASE
    `).bind(username).first();

    if (existingUser) {
        return c.json({ available: false, message: 'Username is already taken' }, 200);
    }

    return c.json({ available: true }, 200);
}

/**
 * Look up email for a given username (for login with username)
 * GET /auth/lookup-email?username=xxx
 */
export async function lookupEmail(c: Context) {
    const env: Env = c.env;
    const username = c.req.query('username');

    if (!username) {
        return c.json({ error: 'Username is required' }, 400);
    }

    // Look up user by username
    const user = await env.DB.prepare(`
        SELECT email FROM user WHERE username = ? COLLATE NOCASE AND is_anonymous = 0
    `).bind(username).first<{ email: string }>();

    if (!user || !user.email) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ email: user.email }, 200);
}

/**
 * Register a new user after Firebase authentication
 * Links Firebase UID with username and display name in backend
 * POST /auth/register
 */
export async function registerUser(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number | undefined;
    const isAnonymous = c.get('isAnonymous') as boolean | undefined;
    const firebaseClaims = c.get('firebaseClaims') as FirebaseClaims | undefined;

    // Must have valid Firebase authentication
    if (!firebaseClaims) {
        return c.json({ message: 'Authentication required' }, 401);
    }

    const body = await c.req.json();
    const { username, displayname } = body;
    
    console.log('registerUser -> received body:', JSON.stringify(body));
    console.log('registerUser -> username:', username, 'displayname:', displayname);

    if (!username) {
        return c.json({ message: 'Username is required' }, 400);
    }

    // Validate username format
    if (!/^[a-z0-9._-]{3,20}$/i.test(username)) {
        return c.json({
            message: 'Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens'
        }, 400);
    }

    // Check if username is reserved
    if (!isUsernameValid(username)) {
        return c.json({ message: 'Username is reserved' }, 400);
    }

    const firebaseUid = firebaseClaims.user_id || firebaseClaims.sub;
    const email = firebaseClaims.email ?? null;
    const emailVerified = firebaseClaims.email_verified ? 1 : 0;
    const photoUrl = firebaseClaims.picture ?? null;
    const authProvider = firebaseClaims.firebase?.sign_in_provider || 'firebase';

    console.log('registerUser -> userId:', userId, 'isAnonymous:', isAnonymous);
    
    try {
        // If we already have a user from the middleware (upserted), update their username
        if (userId && !isAnonymous) {
            console.log('registerUser -> taking UPDATE path');
            // Check if username is already taken by another user (exclude current user)
            const existingUsername = await env.DB.prepare(`
                SELECT id FROM user WHERE username = ? COLLATE NOCASE AND id != ?
            `).bind(username, userId).first();

            if (existingUsername) {
                return c.json({ message: 'Username is already taken' }, 409);
            }

            // Use displayname if provided and not empty, otherwise use username
            const finalDisplayname = displayname && displayname.trim() ? displayname.trim() : username;
            
            console.log('registerUser UPDATE path -> userId:', userId, 'firebaseUid:', firebaseUid, 'username:', username, 'finalDisplayname:', finalDisplayname);
            
            // First verify the user exists
            const beforeUpdate = await env.DB.prepare(`SELECT id, username, displayname FROM user WHERE id = ?`).bind(userId).first();
            console.log('registerUser BEFORE UPDATE:', beforeUpdate);
            
            const updateResult = await env.DB.prepare(`
                UPDATE user
                SET username = ?,
                    displayname = ?,
                    pfp = COALESCE(?, pfp)
                WHERE id = ? AND firebase_uid = ?
            `).bind(
                username,
                finalDisplayname,
                photoUrl,
                userId,
                firebaseUid
            ).run();
            
            console.log('registerUser UPDATE changes:', updateResult.meta.changes);
            
            // Then fetch the updated user
            const user = await env.DB.prepare(`
                SELECT id, username, displayname, email, bio, pfp, is_anonymous
                FROM user WHERE id = ?
            `).bind(userId).first<UserView>();

            console.log('registerUser AFTER UPDATE:', user);

            if (!user) {
                return c.json({ message: 'Failed to update user' }, 500);
            }

            // Add user to general community
            await env.DB.prepare(`
                INSERT OR IGNORE INTO user_community (user_id, community_id, role_id)
                VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
            `).bind(user.id).run();

            return c.json(user, 201);
        }

        // Check if username is already taken (for new user creation)
        const existingUsername = await env.DB.prepare(`
            SELECT id FROM user WHERE username = ? COLLATE NOCASE
        `).bind(username).first();

        if (existingUsername) {
            return c.json({ message: 'Username is already taken' }, 409);
        }

        // Create new user
        // Use displayname if provided and not empty, otherwise use username
        const finalDisplaynameNew = displayname && displayname.trim() ? displayname.trim() : username;
        
        const user = await env.DB.prepare(`
            INSERT INTO user (firebase_uid, username, displayname, email, email_verified, auth_provider, pfp, is_anonymous)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            RETURNING id, username, displayname, email, bio, pfp, is_anonymous
        `).bind(
            firebaseUid,
            username,
            finalDisplaynameNew,
            email,
            emailVerified,
            authProvider,
            photoUrl
        ).first<UserView>();

        if (!user) {
            return c.json({ message: 'Failed to create user' }, 500);
        }

        // Add user to general community
        await env.DB.prepare(`
            INSERT OR IGNORE INTO user_community (user_id, community_id, role_id)
            VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
        `).bind(user.id).run();

        return c.json(user, 201);
    } catch (e) {
        console.error('registerUser error:', e);
        return c.json({ message: 'Internal Server Error' }, 500);
    }
}

/**
 * Upgrade an anonymous user to a registered user
 * Transfers anonymous data (posts, comments, etc.) to the new account
 * POST /auth/upgrade-anonymous
 */
export async function upgradeAnonymous(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number | undefined;
    const firebaseClaims = c.get('firebaseClaims') as FirebaseClaims | undefined;

    // Must have valid Firebase authentication
    if (!firebaseClaims) {
        return c.json({ message: 'Authentication required' }, 401);
    }

    if (!userId) {
        return c.json({ message: 'No user to upgrade' }, 400);
    }

    // Check if user is anonymous in the DATABASE (not context, since provider may have changed after linkWithCredential)
    const currentUser = await env.DB.prepare(`
        SELECT is_anonymous FROM user WHERE id = ?
    `).bind(userId).first<{ is_anonymous: number }>();

    if (!currentUser || currentUser.is_anonymous !== 1) {
        return c.json({ message: 'No anonymous user to upgrade' }, 400);
    }

    const { username, displayname } = await c.req.json();

    if (!username) {
        return c.json({ message: 'Username is required' }, 400);
    }

    // Validate username format
    if (!/^[a-z0-9._-]{3,20}$/i.test(username)) {
        return c.json({
            message: 'Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens'
        }, 400);
    }

    // Check if username is reserved
    if (!isUsernameValid(username)) {
        return c.json({ message: 'Username is reserved' }, 400);
    }

    const firebaseUid = firebaseClaims.user_id || firebaseClaims.sub;
    const email = firebaseClaims.email ?? null;
    const emailVerified = firebaseClaims.email_verified ? 1 : 0;
    const photoUrl = firebaseClaims.picture ?? null;
    const authProvider = firebaseClaims.firebase?.sign_in_provider || 'firebase';

    try {
        // Check if username is already taken
        const existingUsername = await env.DB.prepare(`
            SELECT id FROM user WHERE username = ? COLLATE NOCASE AND id != ?
        `).bind(username, userId).first();

        if (existingUsername) {
            return c.json({ message: 'Username is already taken' }, 409);
        }

        // Update anonymous user to registered user
        // Use displayname if provided and not empty, otherwise use username
        const finalDisplayname = displayname && displayname.trim() ? displayname.trim() : username;
        
        const user = await env.DB.prepare(`
            UPDATE user
            SET firebase_uid = ?,
                username = ?,
                displayname = ?,
                email = ?,
                email_verified = ?,
                auth_provider = ?,
                pfp = COALESCE(pfp, ?),
                is_anonymous = 0
            WHERE id = ?
            RETURNING id, username, displayname, email, bio, pfp, is_anonymous
        `).bind(
            firebaseUid,
            username,
            finalDisplayname,
            email,
            emailVerified,
            authProvider,
            photoUrl,
            userId
        ).first<UserView>();

        if (!user) {
            return c.json({ message: 'Failed to upgrade user' }, 500);
        }

        // Add user to general community if not already a member
        await env.DB.prepare(`
            INSERT OR IGNORE INTO user_community (user_id, community_id, role_id)
            VALUES (?, 0, (SELECT id FROM community_role WHERE community_id = 0 AND level = 0))
        `).bind(user.id).run();

        return c.json(user, 200);
    } catch (e) {
        console.error('upgradeAnonymous error:', e);
        return c.json({ message: 'Internal Server Error' }, 500);
    }
}

/**
 * Get current user data using Firebase authentication
 * GET /auth/me
 */
export async function authenticateUserFirebase(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId') as number | undefined;

    if (!userId) {
        return c.json({ user: null }, 200);
    }

    try {
        const user = await env.DB.prepare(`
            SELECT id, username, displayname, email, email_verified, bio, pfp, is_anonymous, is_admin, created_at
            FROM user
            WHERE id = ?
        `).bind(userId).first<UserView & { is_admin: number }>();

        if (!user) {
            return c.json({ user: null }, 200);
        }

        return c.json({ user, status: 200 }, 200);
    } catch (e) {
        console.error('authenticateUserFirebase error:', e);
        return c.json({ message: 'Internal Server Error' }, 500);
    }
}

/**
 * Check if the current Firebase user exists and is not anonymous
 * GET /auth/isUser
 */
export async function isUserFirebase(c: Context) {
    const userId = c.get('userId') as number | undefined;
    const isAnonymous = c.get('isAnonymous') as boolean | undefined;

    if (!userId) {
        return c.json({ user: false, status: 200 }, 200);
    }

    if (isAnonymous) {
        return c.json({ user: false, status: 200 }, 200);
    }

    return c.json({ user: true, status: 200 }, 200);
}

/**
 * Check if the current Firebase user is anonymous
 * GET /auth/isAnon
 */
export async function isAnonFirebase(c: Context) {
    const userId = c.get('userId') as number | undefined;
    const isAnonymous = c.get('isAnonymous') as boolean | undefined;

    if (!userId) {
        // No user at all
        return c.json({ message: 'No user', anon: false, status: 200 }, 200);
    }

    if (isAnonymous) {
        return c.json({ message: 'Anonymous', anon: true, status: 200 }, 200);
    }

    return c.json({ message: 'Not Anonymous', anon: false, status: 200 }, 200);
}

/**
 * Logout - for Firebase, this is mainly client-side
 * The server can clear any server-side state if needed
 * POST /auth/logout
 */
export async function logoutFirebase(c: Context) {
    // Firebase logout is handled client-side
    // This endpoint is here for any server-side cleanup if needed
    return c.json({ message: 'Logged out' }, 200);
}

// Type definition for Firebase Claims
interface FirebaseClaims {
    aud: string;
    iss: string;
    sub: string;
    user_id: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    auth_time?: number;
    firebase?: {
        sign_in_provider?: string;
        tenant?: string;
        [key: string]: unknown;
    };
}
