import app from "../../index";

const comment = app.basePath('/comment');

// add comment reply to post
comment.post('/');
comment.delete('/');
