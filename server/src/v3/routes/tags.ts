import { Hono } from 'hono';
import { getTags } from '../controllers/tags.controller';

const app = new Hono<{ Bindings: Env}>();

app.get('/', (c) => getTags(c));

export default app;
