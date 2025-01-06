import { Hono } from 'hono';
import { JwtVariables } from 'hono/jwt';
import { getNotifications } from '../controllers/notification.controller';
import { authMiddlewareCheckOnly } from '../util/middleware';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.get('/', authMiddlewareCheckOnly, (c) => getNotifications(c));

export default app;
