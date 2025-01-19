import { Hono } from 'hono';
import { authMiddleware, authMiddlewareCheckOnly } from '../util/middleware';
import { comment, deleteComment, getCommentsOnPost, likeComment } from '../controllers/comment.controller';


const app = new Hono<{ Bindings: Env }>();

app.post('/', authMiddleware, (c) => comment(c));
app.post('/like/:commentId', authMiddleware, (c) => likeComment(c));
app.get('/:postId', authMiddlewareCheckOnly, (c) => getCommentsOnPost(c));
app.delete('/:commentId', authMiddlewareCheckOnly, (c) => deleteComment(c));

export default app;
