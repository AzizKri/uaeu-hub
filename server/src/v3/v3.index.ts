import { Hono } from 'hono';
import post from './routes/post';
import user from './routes/user';
import attachment from './routes/attachment';
import comment from './routes/comment';
import community from './routes/community';
import subcomment from './routes/subcomment';
import tags from './routes/tags';
import websocket from './routes/websocket';
import notification from './routes/notification';
import auth from './routes/auth';
import report from './routes/report';
import feedback from './routes/feedback';

const app = new Hono<{ Bindings: Env }>();

app.route('/auth', auth);
app.route('/user', user);
app.route('/post', post);
app.route('/comment', comment);
app.route('/subcomment', subcomment);
app.route('/attachment', attachment);
app.route('/community', community);
app.route('/tags', tags);
app.route('/notification', notification);
app.route('/ws', websocket);
app.route('/report', report);
app.route('/feedback', feedback);

export default app;
