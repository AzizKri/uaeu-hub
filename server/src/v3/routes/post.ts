import { Context, Hono } from 'hono';
import {
    createPost,
    deletePost,
    getBestPosts,
    getBestPostsFromMyCommunities,
    getLatestPosts,
    getLatestPostsFromMyCommunities,
    getPostByID,
    getPostsByUser,
    likePost,
    searchPosts
} from '../controllers/post.controller';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly, postRateLimitMiddleware } from '../middleware';


const app = new Hono<{ Bindings: Env }>();

// spent an hour trying to figure out why /latest/:page? works but /latest doesn't
// do NOT place any route with parameters above /latest/:page? or the parameterless route will break, with your bones

app.post('/', postRateLimitMiddleware, firebaseAuthMiddleware, (c: Context) => createPost(c));
app.delete('/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => deletePost(c));
app.post('/like/:id', firebaseAuthMiddleware, (c: Context) => likePost(c));

app.get('/latest', firebaseAuthMiddlewareCheckOnly, (c: Context) => getLatestPosts(c));
app.get('/best', firebaseAuthMiddlewareCheckOnly, (c: Context) => getBestPosts(c));

app.get('/myLatest', firebaseAuthMiddlewareCheckOnly, (c: Context) => getLatestPostsFromMyCommunities(c));
app.get('/myBest', firebaseAuthMiddlewareCheckOnly, (c: Context) => getBestPostsFromMyCommunities(c));

app.get('/search', (c: Context) => searchPosts(c));

app.get('/user/:user', firebaseAuthMiddlewareCheckOnly, (c: Context) => getPostsByUser(c));
app.get('/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => getPostByID(c));

export default app;
