import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly, postRateLimitMiddleware } from '../middleware';
import {
    deleteSubcomment,
    getSubcommentsOnComment,
    likeSubcomment,
    subcomment
} from '../controllers/subcomment.controller';


const app = new Hono<{ Bindings: Env }>();

app.post('/', postRateLimitMiddleware, firebaseAuthMiddleware, (c: Context) => subcomment(c));
app.post('/like/:scid', firebaseAuthMiddleware, (c: Context) => likeSubcomment(c));
app.get('/:cid', firebaseAuthMiddlewareCheckOnly, (c: Context) => getSubcommentsOnComment(c));
app.delete('/:scid', firebaseAuthMiddlewareCheckOnly, (c: Context) => deleteSubcomment(c));

export default app;
