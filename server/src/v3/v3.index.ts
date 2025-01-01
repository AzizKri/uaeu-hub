import { Hono } from 'hono';
import post from './routes/post';
import user from './routes/user';
import attachment from './routes/attachment';
import comment from './routes/comment';
import community from './routes/community';
import subcomment from './routes/subcomment';
import tags from './routes/tags';

const app = new Hono<{ Bindings: Env }>();

app.route('/user', user)
app.route('/post', post)
app.route('/comment', comment)
app.route('/subcomment', subcomment)
app.route('/attachment', attachment)
app.route('/community', community)
app.route('/tags', tags)

export default app
