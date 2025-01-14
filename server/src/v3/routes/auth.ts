import { Hono } from 'hono';
import { authMiddlewareCheckOnly } from '../util/middleware';
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

export default app;
