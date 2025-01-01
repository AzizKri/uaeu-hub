import { Hono } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';
import {
    deleteSubcomment,
    getSubcommentsOnComment,
    likeSubcomment,
    subcomment
} from '../controllers/subcomment.controller';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

app.post('/', (c) => subcomment(c));
app.post('/like/:scid', (c) => likeSubcomment(c));
app.get('/:cid', (c) => getSubcommentsOnComment(c));
app.delete('/:scid' , (c) => deleteSubcomment(c));

export default app;
