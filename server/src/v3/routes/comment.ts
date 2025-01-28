import { Context, Hono } from 'hono';
import { authMiddleware, authMiddlewareCheckOnly } from '../middleware';
import { comment, deleteComment, getCommentsOnPost, likeComment } from '../controllers/comment.controller';


const app = new Hono<{ Bindings: Env }>();

app.post('/', authMiddleware, (c: Context) => comment(c));
app.post('/like/:commentId', authMiddleware, (c: Context) => likeComment(c));
app.get('/:postId', authMiddlewareCheckOnly, (c: Context) => getCommentsOnPost(c));
app.delete('/:commentId', authMiddlewareCheckOnly, (c: Context) => deleteComment(c));

export default app;
