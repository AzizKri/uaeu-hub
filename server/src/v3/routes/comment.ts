import { Hono } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';
import { comment, deleteComment, getCommentsOnPost, likeComment } from '../controllers/comment.controller';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

app.post('/', (c) => comment(c));
app.post('/like/:commentId', (c) => likeComment(c));
app.get('/:postId', (c) => getCommentsOnPost(c));
app.delete('/:commentId', (c) => deleteComment(c));

export default app;
