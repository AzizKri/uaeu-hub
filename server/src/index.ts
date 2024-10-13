import { Hono } from 'hono';
import { cors } from 'hono/cors';
import user from './v2/routes/user';
import post from './v2/routes/post';
import v1 from './v1/index';

const app = new Hono<{ Bindings: Env }>();

app.use(cors({
	origin: ['https://uaeu.chat', 'http://localhost:5173']
}))

app.route('/v1', v1); // deprecated
app.route('/user', user);
app.route('/post', post);

// app.onError((c, err) => {
// 	console.error(c, err);
// 	return new Response('Internal Server Error', { status: 500 });
// });
app.fire();

export default app;
