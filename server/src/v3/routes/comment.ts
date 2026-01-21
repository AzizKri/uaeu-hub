import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly, penaltyCheckMiddleware, blockPenalizedUserMiddleware } from '../middleware';
import { comment, deleteComment, getCommentsOnPost, likeComment } from '../controllers/comment.controller';


const app = new Hono<{ Bindings: Env }>();

app.post('/', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => comment(c));
app.post('/like/:commentId', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => likeComment(c));
app.get('/:postId', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommentsOnPost(c));
app.delete('/:commentId', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => deleteComment(c));

export default app;
