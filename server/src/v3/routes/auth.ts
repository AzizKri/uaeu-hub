import { Context, Hono } from 'hono';
import { authMiddlewareCheckOnly } from '../middleware';
import {
    authenticateUser,
    authenticateWithGoogle,
    changePassword,
    forceLogout,
    isAnon,
    isUser,
    login,
    logout,
    resetPassword,
    sendEmailVerification,
    sendForgotPasswordEmail,
    signup,
    verifyEmail
} from '../controllers/auth.controller';
import { validator } from 'hono/validator';
import { forgotPasswordSchema, passwordChangeSchema, passwordResetSchema } from '../util/validationSchemas';

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

// Password
app.post('/forgotPassword',
    validator('json', (value, c: Context) => {
        const parsed = forgotPasswordSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    (c: Context) => sendForgotPasswordEmail(c));
app.post('/resetPassword',
    validator('json', (value, c: Context) => {
        const parsed = passwordResetSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    (c: Context) => resetPassword(c));
app.post('/changePassword',
    validator('json', (value, c: Context) => {
        const parsed = passwordChangeSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => changePassword(c));

// User data

app.get('/me', authMiddlewareCheckOnly, (c: Context) => authenticateUser(c));
app.get('/isUser', (c: Context) => isUser(c));
app.get('/isAnon', authMiddlewareCheckOnly, (c: Context) => isAnon(c));

export default app;
