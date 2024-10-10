import {Hono} from "hono";
import {Authenticate, getByUsername} from "../controllers/user.controller";

type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/:username', (c) => getByUsername(c));
app.get('/authenticate', (c) => Authenticate(c));

export default app;
