import { Hono } from 'hono';
import {
    createWebSocketEntry,
    deleteWebSocketEntry,
    getUserIdFromWebSocketId
} from '../controllers/websocket.controller';

const app = new Hono<{ Bindings: Env }>();

app.get('/:uuid', (c) => getUserIdFromWebSocketId(c));
app.post('/', (c) => createWebSocketEntry(c));
app.delete('/:uuid', (c) => deleteWebSocketEntry(c));

export default app;
