import {Hono} from "hono";
import {Authenticate, getByUsername} from "../controllers/user.controller";

const app = new Hono<{ Bindings: Env }>();

app.get('/:username', (c) => getByUsername(c));
app.get('/authenticate', (c) => Authenticate(c));

export default app;
