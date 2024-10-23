import { Hono } from 'hono';
import { getByUsername, login, signup } from '../controllers/user.controller';

const app = new Hono<{ Bindings: Env }>();

app.post('/signup', (c) => signup(c));
app.post('/login', (c) => login(c));
// app.get('/anon', (c) => generateAnonSessionId(c));
app.get('/:username', (c) => getByUsername(c));

export default app;
