import {Hono} from "hono";
import { createPost, getLatestPosts, getPostByID, getPostsByUser } from '../controllers/post.controller';

const app = new Hono<{ Bindings: Env }>();

// spent an hour trying to figure out why /latest/:page? works but /latest doesn't
// do NOT place any route with parameters above /latest/:page? or the parameterless route will break, with your bones

app.get('/latest/:page?', (c) => getLatestPosts(c))						// api.uaeu.chat/post/latest/:page
app.post('/create', (c) => createPost(c))											// api.uaeu.chat/post/create
app.get('/user/:username/:page?', (c) => getPostsByUser(c))		// api.uaeu.chat/post/user/:username/:page
app.get('/:id', (c) => getPostByID(c))												// api.uaeu.chat/post/:id

export default app;
