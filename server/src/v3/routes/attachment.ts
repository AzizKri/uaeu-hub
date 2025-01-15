import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import {
    deleteAttachment,
    getAttachmentDetails,
    uploadAttachment,
    uploadIcon
} from '../controllers/attachment.controller';
import { authMiddleware, authMiddlewareCheckOnly, uploadAttachmentLimitMiddleware } from '../util/middleware';


const app = new Hono<{ Bindings: Env}>();

app.post('/', uploadAttachmentLimitMiddleware, authMiddleware, (c) => uploadAttachment(c), bodyLimit({
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.text('File too large', 400)
}));
app.get('/:filename', (c) => getAttachmentDetails(c));
app.delete('/:filename', authMiddlewareCheckOnly, (c) => deleteAttachment(c));

app.post('/icon', uploadAttachmentLimitMiddleware, authMiddlewareCheckOnly, (c) => uploadIcon(c), bodyLimit({
    maxSize: 5 * 1024 * 1024,
    onError: (c) => c.text('File too large', 400)
}));

export default app;
