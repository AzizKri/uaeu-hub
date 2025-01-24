import { Hono } from 'hono';
import { getNotifications, readNotifications } from '../controllers/notification.controller';
import { authMiddlewareCheckOnly } from '../util/middleware';


const app = new Hono<{ Bindings: Env }>();

app.get('/', authMiddlewareCheckOnly, (c) => getNotifications(c));
app.post('/read', authMiddlewareCheckOnly, (c) => readNotifications(c));

export default app;
