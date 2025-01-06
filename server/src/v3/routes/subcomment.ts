import { Hono } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware, authMiddlewareCheckOnly, postRateLimitMiddleware } from '../util/middleware';
import {
    deleteSubcomment,
    getSubcommentsOnComment,
    likeSubcomment,
    subcomment
} from '../controllers/subcomment.controller';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.post('/', postRateLimitMiddleware, authMiddleware, (c) => subcomment(c));
app.post('/like/:scid', authMiddleware, (c) => likeSubcomment(c));
app.get('/:cid', authMiddlewareCheckOnly, (c) => getSubcommentsOnComment(c));
app.delete('/:scid', authMiddlewareCheckOnly, (c) => deleteSubcomment(c));

export default app;
