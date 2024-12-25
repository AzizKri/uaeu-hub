import { Hono } from 'hono';
import {
    anonSignup,
    getUserByUsername,
    getUserBySessionKey, isAnon,
    isUser,
    login,
    logout,
    signup
} from '../controllers/user.controller';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => getUserBySessionKey(c));
app.post('/signup', (c) => signup(c));
app.post('/login', (c) => login(c));
app.get('/logout', (c) => logout(c));
app.get('/anon', (c) => anonSignup(c));
app.get('/isUser', (c) => isUser(c));
app.get('/isAnon', (c) => isAnon(c));
app.get('/:username', (c) => getUserByUsername(c));

export default app;
