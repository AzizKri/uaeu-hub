import { Hono } from 'hono';
import {
    createPost, deletePost,
    getLatestPosts,
    getPostByID,
    getPostsByUser,
    searchPosts
} from '../controllers/post.controller';
import type { JwtVariables } from 'hono/jwt';
import { authMiddleware, postRateLimitMiddleware } from '../util/middleware';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware, postRateLimitMiddleware);

// spent an hour trying to figure out why /latest/:page? works but /latest doesn't
// do NOT place any route with parameters above /latest/:page? or the parameterless route will break, with your bones

app.post('/', (c) => createPost(c));                                // api.uaeu.chat/post
app.delete('/:id', (c) => deletePost(c));                           // api.uaeu.chat/post/:id
app.get('/latest/:page?', (c) => getLatestPosts(c));				// api.uaeu.chat/post/latest/:page
app.get('/search/:query', (c) => searchPosts(c));					// api.uaeu.chat/post/search/:query
app.get('/user/:username/:page?', (c) => getPostsByUser(c));		// api.uaeu.chat/post/user/:username/:page
app.get('/:id', (c) => getPostByID(c));								// api.uaeu.chat/post/:id

export default app;
