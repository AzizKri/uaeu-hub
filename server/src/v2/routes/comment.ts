import {Hono} from "hono";

const comment = new Hono().basePath('/comment');

// add comment reply to post
comment.post('/');
comment.delete('/');
