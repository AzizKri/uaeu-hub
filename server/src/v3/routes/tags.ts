import { Context, Hono } from 'hono';
import { getTags } from '../controllers/tags.controller';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c: Context) => getTags(c));

export default app;
