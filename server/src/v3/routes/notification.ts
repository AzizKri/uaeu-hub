import { Hono } from 'hono';
import { getNotifications } from '../controllers/notification.controller';
import { authMiddlewareCheckOnly } from '../util/middleware';


const app = new Hono<{ Bindings: Env}>();

app.get('/', authMiddlewareCheckOnly, (c) => getNotifications(c));

export default app;
