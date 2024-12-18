import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { getAttachmentDetails, uploadAttachment } from '../controllers/attachment.controller';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware, uploadAttachmentateLimitMiddleware } from '../util/middleware';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);
app.use('/', uploadAttachmentateLimitMiddleware);

app.post('/', (c) => uploadAttachment(c), bodyLimit({						// api.uaeu.chat/attachment
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.text('File too large', 400)
}));
app.get('/:filename', (c) => getAttachmentDetails(c));						// api.uaeu.chat/attachment/:filename
export default app;
