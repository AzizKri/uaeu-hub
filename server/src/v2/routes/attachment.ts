import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { uploadAttachment } from '../controllers/attachment.controller';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

app.post('/', (c) => uploadAttachment(c), bodyLimit({						// api.uaeu.chat/attachment
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.text('File too large', 400)
}));

export default app;
