import {Hono} from "hono";
import {Bindings} from "../../util/types";
import { createPost, getLatestPosts, getPostByID, getPostsByUser } from '../controllers/post.controller';

const app = new Hono<{ Bindings: Bindings }>();

// spent an hour trying to figure out why /latest/:page? works but /latest doesn't
// do NOT place any route with parameters above /latest/:page? or the parameterless route will break, with your bones

app.get('/latest/:page?', (c) => getLatestPosts(c))
app.post('/create', (c) => createPost(c))
app.get('/user/:username/:page?', (c) => getPostsByUser(c))
app.get('/:id', (c) => getPostByID(c))

export default app;
