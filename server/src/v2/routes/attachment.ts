import { Hono } from 'hono';
import { createAttachment, getAttachments } from '../controllers/attachment.controller';

const app = new Hono<{ Bindings: Env }>();

app.get('/post/:id', (c) => getAttachments(c))
app.post('/create', (c) => createAttachment(c))

export default app;
