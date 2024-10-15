import { Hono } from 'hono';
import { createPost, getLatestPosts, getPostByID, getPostsByUser, searchPosts } from '../controllers/post.controller';
import { bodyLimit } from 'hono/body-limit';

const app = new Hono<{ Bindings: Env }>();

// spent an hour trying to figure out why /latest/:page? works but /latest doesn't
// do NOT place any route with parameters above /latest/:page? or the parameterless route will break, with your bones

app.get('/latest/:page?', (c) => getLatestPosts(c));						// api.uaeu.chat/post/latest/:page
app.get('/search/:query', (c) => searchPosts(c));								// api.uaeu.chat/post/search/:query
app.post('/create', (c) => createPost(c), bodyLimit({						// api.uaeu.chat/post/create
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.text('File too large', 400)
}));
app.get('/user/:username/:page?', (c) => getPostsByUser(c));		// api.uaeu.chat/post/user/:username/:page
app.get('/:id', (c) => getPostByID(c));													// api.uaeu.chat/post/:id

export default app;
