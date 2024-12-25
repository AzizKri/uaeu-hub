import { Hono } from 'hono';
import { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';
import { getCommunity } from '../controllers/community.controller';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

app.get('/:cid', (c) => getCommunity(c));

export default app;
