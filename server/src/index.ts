import { Hono } from 'hono';
import user from './v2/routes/user';
import post from './v2/routes/post';
import {Bindings} from "./util/types";

const app = new Hono<{ Bindings: Bindings }>();
app.route('/user', user);
app.route('/post', post);

app.onError((c, err) => {
	console.error(err);
	return new Response('Internal Server Error', { status: 500 });
});
app.fire();

export default app;
