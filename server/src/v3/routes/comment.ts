import { Hono } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

app.post('/');
app.delete('/');
