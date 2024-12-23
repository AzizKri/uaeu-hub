import { Hono } from 'hono';
import { anonSignup, getByUsername, isUser, login, signup } from '../controllers/user.controller';

const app = new Hono<{ Bindings: Env }>();

app.post('/signup', (c) => signup(c));
app.post('/login', (c) => login(c));
app.get('/anon', (c) => anonSignup(c));
app.get('/isUser', (c) => isUser(c));
app.get('/:username', (c) => getByUsername(c));

export default app;
