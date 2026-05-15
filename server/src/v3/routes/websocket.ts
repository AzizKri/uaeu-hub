import { Context, Hono } from 'hono';
import {
    createWebSocketEntry,
    deleteWebSocketEntry,
    getUserIdFromWebSocketId
} from '../controllers/websocket.controller';
import { authMiddlewareCheckOnly } from '../middleware';

const app = new Hono<{ Bindings: Env }>();

app.get('/:uuid', (c: Context) => getUserIdFromWebSocketId(c));
app.post('/', authMiddlewareCheckOnly, (c: Context) => createWebSocketEntry(c));
app.delete('/:uuid', authMiddlewareCheckOnly, (c: Context) => deleteWebSocketEntry(c));

export default app;
