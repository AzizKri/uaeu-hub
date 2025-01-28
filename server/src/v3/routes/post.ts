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
import { authMiddleware, authMiddlewareCheckOnly, postRateLimitMiddleware } from '../middleware';


const app = new Hono<{ Bindings: Env }>();

// spent an hour trying to figure out why /latest/:page? works but /latest doesn't
// do NOT place any route with parameters above /latest/:page? or the parameterless route will break, with your bones

app.post('/', postRateLimitMiddleware, authMiddleware, (c: Context) => createPost(c));
app.delete('/:id', authMiddlewareCheckOnly, (c: Context) => deletePost(c));
app.post('/like/:id', authMiddleware, (c: Context) => likePost(c));

app.get('/latest', authMiddlewareCheckOnly, (c: Context) => getLatestPosts(c));
app.get('/best', authMiddlewareCheckOnly, (c: Context) => getBestPosts(c));

app.get('/myLatest', authMiddlewareCheckOnly, (c: Context) => getLatestPostsFromMyCommunities(c));
app.get('/myBest', authMiddlewareCheckOnly, (c: Context) => getBestPostsFromMyCommunities(c));

app.get('/search', (c: Context) => searchPosts(c));

app.get('/user/:user', authMiddlewareCheckOnly, (c: Context) => getPostsByUser(c));
app.get('/:id', authMiddlewareCheckOnly, (c: Context) => getPostByID(c));

export default app;
