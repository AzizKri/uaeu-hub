import { Hono } from 'hono';
import { authMiddleware, authMiddlewareCheckOnly, postRateLimitMiddleware } from '../util/middleware';
import {
    deleteSubcomment,
    getSubcommentsOnComment,
    likeSubcomment,
    subcomment
} from '../controllers/subcomment.controller';


const app = new Hono<{ Bindings: Env}>();

app.post('/', postRateLimitMiddleware, authMiddleware, (c) => subcomment(c));
app.post('/like/:scid', authMiddleware, (c) => likeSubcomment(c));
app.get('/:cid', authMiddlewareCheckOnly, (c) => getSubcommentsOnComment(c));
app.delete('/:scid', authMiddlewareCheckOnly, (c) => deleteSubcomment(c));

export default app;
