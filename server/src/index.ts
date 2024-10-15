import { Hono } from 'hono';
import { cors } from 'hono/cors';
import user from './v2/routes/user';
import post from './v2/routes/post';
import v1 from './v1/index';

const app = new Hono<{ Bindings: Env }>();

app.use(cors({
    origin: ['https://uaeu.chat', 'https://post-page.uaeu-hub.pages.dev', 'http://localhost:5173']
}));

app.route('/v1', v1); // deprecated
app.route('/user', user);
app.route('/post', post);

export default app;
