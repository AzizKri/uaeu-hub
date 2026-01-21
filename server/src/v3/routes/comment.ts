import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly } from '../middleware';
import { comment, deleteComment, getCommentsOnPost, likeComment } from '../controllers/comment.controller';


const app = new Hono<{ Bindings: Env }>();

app.post('/', firebaseAuthMiddleware, (c: Context) => comment(c));
app.post('/like/:commentId', firebaseAuthMiddleware, (c: Context) => likeComment(c));
app.get('/:postId', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommentsOnPost(c));
app.delete('/:commentId', firebaseAuthMiddleware, (c: Context) => deleteComment(c));

export default app;
