import { Hono } from 'hono';
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
import { authMiddleware, authMiddlewareCheckOnly, postRateLimitMiddleware } from '../util/middleware';


const app = new Hono<{ Bindings: Env }>();

// spent an hour trying to figure out why /latest/:page? works but /latest doesn't
// do NOT place any route with parameters above /latest/:page? or the parameterless route will break, with your bones

app.post('/', postRateLimitMiddleware, authMiddleware, (c) => createPost(c));
app.delete('/:id', authMiddlewareCheckOnly, (c) => deletePost(c));
app.post('/like/:id', authMiddleware, (c) => likePost(c));

app.get('/latest', authMiddlewareCheckOnly, (c) => getLatestPosts(c));
app.get('/best', authMiddlewareCheckOnly, (c) => getBestPosts(c));

app.get('/myLatest', authMiddlewareCheckOnly, (c) => getLatestPostsFromMyCommunities(c));
app.get('/myBest', authMiddlewareCheckOnly, (c) => getBestPostsFromMyCommunities(c));

app.get('/search', (c) => searchPosts(c));

app.get('/user/:user', authMiddlewareCheckOnly, (c) => getPostsByUser(c));
app.get('/:id', authMiddlewareCheckOnly, (c) => getPostByID(c));

export default app;
