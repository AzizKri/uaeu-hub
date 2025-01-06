import { Hono } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware, authMiddlewareCheckOnly } from '../util/middleware';
import { comment, deleteComment, getCommentsOnPost, likeComment } from '../controllers/comment.controller';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.post('/', authMiddleware, (c) => comment(c));
app.post('/like/:commentId', authMiddleware, (c) => likeComment(c));
app.get('/:postId', authMiddlewareCheckOnly, (c) => getCommentsOnPost(c));
app.delete('/:commentId', authMiddlewareCheckOnly, (c) => deleteComment(c));

export default app;
