import { Context, Hono } from 'hono';
import {
    createWebSocketEntry,
    deleteWebSocketEntry,
    getUserIdFromWebSocketId
} from '../controllers/websocket.controller';
import { firebaseAuthMiddlewareCheckOnly } from '../middleware';

const app = new Hono<{ Bindings: Env }>();

app.get('/:uuid', (c: Context) => getUserIdFromWebSocketId(c));
app.post('/', firebaseAuthMiddlewareCheckOnly, (c: Context) => createWebSocketEntry(c));
app.delete('/:uuid', firebaseAuthMiddlewareCheckOnly, (c: Context) => deleteWebSocketEntry(c));

export default app;
