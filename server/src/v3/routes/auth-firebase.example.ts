/**
 * Example route file showing how to use Firebase Authentication middleware
 *
 * This file demonstrates how to use the Firebase authentication middleware
 * in your routes. You can copy this pattern to any route file.
 *
 * IMPORTANT: Set the FIREBASE_PROJECT_ID environment variable in wrangler.toml
 *
 * Example:
 * vars = { FIREBASE_PROJECT_ID = "your-project-id" }
 */

import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly } from '../middleware';

const app = new Hono<{ Bindings: Env }>();

/**
 * Example 1: Protected route that requires authentication
 * - If the user has a valid Firebase token, they are authenticated
 * - If the token is invalid or missing, an anonymous user is created
 * - Use this for routes that REQUIRE a user (e.g., creating posts, liking, etc.)
 */
app.post('/create-post', firebaseAuthMiddleware, async (c: Context) => {
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;
    const firebaseClaims = c.get('firebaseClaims'); // Available if authenticated via Firebase

    if (isAnonymous) {
        return c.json({
            error: 'Authentication required',
            message: 'Please sign in to create a post'
        }, 401);
    }

    // User is authenticated, proceed with the operation
    return c.json({
        message: 'Post created successfully',
        userId: userId,
        userEmail: firebaseClaims?.email
    });
});

/**
 * Example 2: Optional authentication route
 * - If the user has a valid Firebase token, they are authenticated
 * - If the token is invalid or missing, NO anonymous user is created
 * - Use this for routes where authentication is optional (e.g., viewing posts)
 */
app.get('/view-posts', firebaseAuthMiddlewareCheckOnly, async (c: Context) => {
    const userId = c.get('userId') as number | undefined;
    const isAnonymous = c.get('isAnonymous') as boolean | undefined;

    if (userId && !isAnonymous) {
        // User is authenticated, can show personalized content
        return c.json({
            message: 'Viewing posts (authenticated)',
            userId: userId,
            personalizedContent: true
        });
    } else {
        // User is not authenticated, show public content only
        return c.json({
            message: 'Viewing posts (public)',
            personalizedContent: false
        });
    }
});

/**
 * Example 3: Mixed authentication route
 * - Accepts both Firebase authenticated users and anonymous users
 * - Anonymous users are created if no valid token is provided
 * - Use this for routes that can work with both types of users
 */
app.post('/like-post', firebaseAuthMiddleware, async (c: Context) => {
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;

    if (isAnonymous) {
        // Anonymous user can still perform the action
        // But maybe limit their capabilities
        return c.json({
            message: 'Post liked (anonymous)',
            userId: userId,
            note: 'Your like will be lost if you clear cookies'
        });
    }

    // Authenticated user
    return c.json({
        message: 'Post liked successfully',
        userId: userId,
        note: 'Your like is saved to your account'
    });
});

/**
 * Example 4: Getting user information from Firebase claims
 */
app.get('/profile', firebaseAuthMiddleware, async (c: Context) => {
    const userId = c.get('userId') as number;
    const isAnonymous = c.get('isAnonymous') as boolean;
    const firebaseClaims = c.get('firebaseClaims');

    if (isAnonymous) {
        return c.json({
            error: 'Authentication required',
            message: 'Please sign in to view your profile'
        }, 401);
    }

    // Get user data from database using the internal userId
    const user = await c.env.DB.prepare(
        `SELECT id, username, displayname, email, email_verified, pfp, bio, created_at
         FROM user WHERE id = ?`
    ).bind(userId).first();

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
        user: user,
        firebaseInfo: {
            uid: firebaseClaims?.user_id,
            email: firebaseClaims?.email,
            emailVerified: firebaseClaims?.email_verified,
            provider: firebaseClaims?.firebase?.sign_in_provider
        }
    });
});

export default app;

