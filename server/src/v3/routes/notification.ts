import { Context, Hono } from 'hono';
import { getNotifications, readNotifications } from '../controllers/notification.controller';
import { firebaseAuthMiddlewareCheckOnly } from '../middleware';


const app = new Hono<{ Bindings: Env }>();

app.get('/', firebaseAuthMiddlewareCheckOnly, (c: Context) => getNotifications(c));
app.post('/read', firebaseAuthMiddlewareCheckOnly, (c: Context) => readNotifications(c));

export default app;
