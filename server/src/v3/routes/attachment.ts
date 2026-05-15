import { Context, Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import {
    deleteAttachment,
    getAttachmentDetails,
    uploadAttachment,
    uploadIcon
} from '../controllers/attachment.controller';
import { authMiddleware, authMiddlewareCheckOnly, uploadAttachmentLimitMiddleware } from '../middleware';


const app = new Hono<{ Bindings: Env }>();

app.post('/', uploadAttachmentLimitMiddleware, authMiddleware, (c: Context) => uploadAttachment(c), bodyLimit({
    maxSize: 10 * 1024 * 1024,
    onError: (c: Context) => c.text('File too large', 400)
}));
app.get('/:filename', (c: Context) => getAttachmentDetails(c));
app.delete('/:filename', authMiddlewareCheckOnly, (c: Context) => deleteAttachment(c));

app.post('/icon', uploadAttachmentLimitMiddleware, authMiddlewareCheckOnly, (c: Context) => uploadIcon(c), bodyLimit({
    maxSize: 5 * 1024 * 1024,
    onError: (c: Context) => c.text('File too large', 400)
}));

export default app;
