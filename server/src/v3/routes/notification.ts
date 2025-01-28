import { Context, Hono } from 'hono';
import { getNotifications, readNotifications } from '../controllers/notification.controller';
import { authMiddlewareCheckOnly } from '../middleware';


const app = new Hono<{ Bindings: Env }>();

app.get('/', authMiddlewareCheckOnly, (c: Context) => getNotifications(c));
app.post('/read', authMiddlewareCheckOnly, (c: Context) => readNotifications(c));

export default app;
