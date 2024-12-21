import { Hono } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';
import { comment, getCommentsOnPost } from '../controllers/comment.controller';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

app.post('/', (c) => comment(c));
app.get('/:postid/:page', (c) => getCommentsOnPost(c));
app.delete('/');

export default app;
