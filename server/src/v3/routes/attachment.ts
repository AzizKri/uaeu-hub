import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { deleteAttachment, getAttachmentDetails, uploadAttachment } from '../controllers/attachment.controller';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware, authMiddlewareCheckOnly, uploadAttachmentLimitMiddleware } from '../util/middleware';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.post('/', uploadAttachmentLimitMiddleware, authMiddleware, (c) => uploadAttachment(c), bodyLimit({
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.text('File too large', 400)
}));
app.get('/:filename', (c) => getAttachmentDetails(c));
app.delete('/:filename', authMiddlewareCheckOnly, (c) => deleteAttachment(c));

export default app;
