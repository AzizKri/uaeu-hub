import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly, postRateLimitMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware } from '../middleware';
import {
    deleteSubcomment,
    getSubcommentsOnComment,
    likeSubcomment,
    subcomment
} from '../controllers/subcomment.controller';


const app = new Hono<{ Bindings: Env }>();

app.post('/', postRateLimitMiddleware, firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => subcomment(c));
app.post('/like/:scid', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => likeSubcomment(c));
app.get('/:cid', firebaseAuthMiddlewareCheckOnly, (c: Context) => getSubcommentsOnComment(c));
app.delete('/:scid', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => deleteSubcomment(c));

export default app;
