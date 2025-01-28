import { Context, Hono } from 'hono';
import { authMiddleware, authMiddlewareCheckOnly, postRateLimitMiddleware } from '../middleware';
import {
    deleteSubcomment,
    getSubcommentsOnComment,
    likeSubcomment,
    subcomment
} from '../controllers/subcomment.controller';


const app = new Hono<{ Bindings: Env }>();

app.post('/', postRateLimitMiddleware, authMiddleware, (c: Context) => subcomment(c));
app.post('/like/:scid', authMiddleware, (c: Context) => likeSubcomment(c));
app.get('/:cid', authMiddlewareCheckOnly, (c: Context) => getSubcommentsOnComment(c));
app.delete('/:scid', authMiddlewareCheckOnly, (c: Context) => deleteSubcomment(c));

export default app;
