import { Hono } from 'hono';
import {
    createWebSocketEntry,
    deleteWebSocketEntry,
    getUserIdFromWebSocketId
} from '../controllers/websocket.controller';
import { authMiddlewareCheckOnly } from '../util/middleware';

const app = new Hono<{ Bindings: Env }>();

app.get('/:uuid', (c) => getUserIdFromWebSocketId(c));
app.post('/', authMiddlewareCheckOnly, (c) => createWebSocketEntry(c));
app.delete('/:uuid', authMiddlewareCheckOnly, (c) => deleteWebSocketEntry(c));

export default app;
