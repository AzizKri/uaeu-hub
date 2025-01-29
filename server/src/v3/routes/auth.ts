import { Context, Hono } from 'hono';
import { authMiddlewareCheckOnly } from '../middleware';
import {
    authenticateUser,
    authenticateWithGoogle,
    forceLogout,
    isAnon,
    isUser,
    login,
    logout, sendEmailVerification,
    signup, verifyEmail
} from '../controllers/auth.controller';

const app = new Hono<{ Bindings: Env }>();

// Login & Signup
app.post('/signup', authMiddlewareCheckOnly, (c: Context) => signup(c));
app.post('/google', authMiddlewareCheckOnly, (c: Context) => authenticateWithGoogle(c));
app.post('/login', authMiddlewareCheckOnly, (c: Context) => login(c));
app.get('/logout', authMiddlewareCheckOnly, (c: Context) => {
    const force = c.req.query('force');
    if (force) return forceLogout(c);
    return logout(c);
});
// app.get('/anon', authMiddlewareCheckOnly, (c: Context) => anonSignup(c) as Promise<never>);

// Email
app.post('/sendEmailVerification', authMiddlewareCheckOnly, (c: Context) => sendEmailVerification(c));
app.get('/verifyEmail', (c: Context) => verifyEmail(c));

// User data

app.get('/me', authMiddlewareCheckOnly, (c: Context) => authenticateUser(c));
app.get('/isUser', (c: Context) => isUser(c));
app.get('/isAnon', authMiddlewareCheckOnly, (c: Context) => isAnon(c));

export default app;
