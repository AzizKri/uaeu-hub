import { Context, Hono } from 'hono';
import { authMiddlewareCheckOnly } from '../middleware';
import {
    anonSignup,
    authenticateUser,
    authenticateWithGoogle,
    isAnon,
    isUser,
    login,
    logout,
    signup
} from '../controllers/auth.controller';

const app = new Hono<{ Bindings: Env }>();

app.get('/me', authMiddlewareCheckOnly, (c) => authenticateUser(c));
app.post('/signup', authMiddlewareCheckOnly, (c) => signup(c));
app.post('/google', authMiddlewareCheckOnly, (c) => authenticateWithGoogle(c));
app.post('/login', authMiddlewareCheckOnly, (c) => login(c));
app.get('/logout', authMiddlewareCheckOnly, (c) => logout(c));
app.get('/anon', authMiddlewareCheckOnly, (c) => anonSignup(c) as Promise<never>);
app.get('/isUser', (c) => isUser(c));
app.get('/isAnon', authMiddlewareCheckOnly, (c) => isAnon(c));
// Login & Signup
app.post('/signup', authMiddlewareCheckOnly, (c: Context) => signup(c));
app.post('/google', authMiddlewareCheckOnly, (c: Context) => authenticateWithGoogle(c));
app.post('/login', authMiddlewareCheckOnly, (c: Context) => login(c));
// User data

app.get('/me', authMiddlewareCheckOnly, (c: Context) => authenticateUser(c));
app.get('/isUser', (c: Context) => isUser(c));
app.get('/isAnon', authMiddlewareCheckOnly, (c: Context) => isAnon(c));

export default app;
