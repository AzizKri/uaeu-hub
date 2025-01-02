import { Hono } from 'hono';
import {
    createPost,
    deletePost,
    getBestPosts, getBestPostsFromMyCommunities,
    getLatestPosts,
    getLatestPostsFromMyCommunities,
    getPostByID,
    getPostsByUser,
    likePost,
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
app.post('/like/:id', (c) => likePost(c));				            // api.uaeu.chat/post/like/:id
app.get('/latest', (c) => getLatestPosts(c));				        // api.uaeu.chat/post/latest?page=
app.get('/best', (c) => getBestPosts(c));				            // api.uaeu.chat/post/best?page=
app.get('/myLatest', (c) => getLatestPostsFromMyCommunities(c));	// api.uaeu.chat/post/myLatest?page=
app.get('/myBest', (c) => getBestPostsFromMyCommunities(c));	    // api.uaeu.chat/post/myBest?page=
app.get('/search', (c) => searchPosts(c));					        // api.uaeu.chat/post/search?query=
app.get('/user/:user', (c) => getPostsByUser(c));		            // api.uaeu.chat/post/user/:username?page=
app.get('/:id', (c) => getPostByID(c));								// api.uaeu.chat/post/:id

export default app;
