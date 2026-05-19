import { Context, Hono } from 'hono';
import { validator } from 'hono/validator';
import { authMiddlewareCheckOnly } from '../middleware';
import {
    authenticateUser,
    changeEmail,
    changePassword,
    checkUsername,
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
import {
    emailChangeSchema,
    forgotPasswordSchema,
    loginSchema,
    passwordChangeSchema,
    passwordResetSchema,
    signupSchema
} from '../util/validationSchemas';
import { validationError } from '../util/requestValidation';

const app = new Hono<{ Bindings: Env }>();

app.get('/check-username', (c: Context) => checkUsername(c));

app.post('/signup',
    validator('json', (value, c: Context) => {
        const parsed = signupSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => signup(c)
);

app.post('/login',
    validator('json', (value, c: Context) => {
        const parsed = loginSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => login(c)
);

app.post('/logout', authMiddlewareCheckOnly, (c: Context) => logout(c));

app.get('/me', authMiddlewareCheckOnly, (c: Context) => authenticateUser(c));
app.get('/isUser', authMiddlewareCheckOnly, (c: Context) => isUser(c));
app.get('/isAnon', authMiddlewareCheckOnly, (c: Context) => isAnon(c));

app.post('/sendEmailVerification', authMiddlewareCheckOnly, (c: Context) => sendEmailVerification(c));
app.get('/verifyEmail', (c: Context) => verifyEmail(c));

app.post('/forgotPassword',
    validator('json', (value, c: Context) => {
        const parsed = forgotPasswordSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    (c: Context) => sendForgotPasswordEmail(c)
);

app.post('/resetPassword',
    validator('json', (value, c: Context) => {
        const parsed = passwordResetSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    (c: Context) => resetPassword(c)
);

app.post('/changePassword',
    validator('json', (value, c: Context) => {
        const parsed = passwordChangeSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => changePassword(c)
);

app.post('/changeEmail',
    validator('json', (value, c: Context) => {
        const parsed = emailChangeSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => changeEmail(c)
);

export default app;
