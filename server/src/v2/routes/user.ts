import {Hono} from "hono";
import { Authenticate, getByUsername } from '../controllers/user.controller';

const app = new Hono<{ Bindings: Env }>();

app.get('/authenticate', (c) => Authenticate(c));
// app.get('/anon', (c) => generateAnonSessionId(c));
app.get('/:username', (c) => getByUsername(c));

export default app;
