import { JwtVariables } from 'hono/jwt';
import { Hono } from 'hono';
// import { authMiddleware } from '../util/middleware';
import { getTags } from '../controllers/tags.controller';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

// app.use('/', authMiddleware);

app.get('/', (c) => getTags(c));

export default app;
