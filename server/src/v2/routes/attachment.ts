import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { uploadAttachment } from '../controllers/attachment.controller';

const app = new Hono<{ Bindings: Env }>();

app.post('/', (c) => uploadAttachment(c), bodyLimit({						// api.uaeu.chat/attachment
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.text('File too large', 400)
}));

export default app;
