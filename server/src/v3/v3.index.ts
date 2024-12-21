import { Hono } from 'hono';
import post from './routes/post';
import user from './routes/user';
import attachment from './routes/attachment';
import comment from './routes/comment';

const app = new Hono<{ Bindings: Env }>();

app.route('/user', user)
app.route('/post', post)
app.route('/comment', comment)
app.route('/attachment', attachment)

export default app
