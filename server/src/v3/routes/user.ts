import { Hono } from 'hono';
import {
    getCurrentUser,
    getUserByUsername,
    getUserCommunities,
    getUserLikesOnComments,
    getUserLikesOnPosts,
    getUserLikesOnSubcomments
} from '../controllers/user.controller';
import { authMiddlewareCheckOnly } from '../util/middleware';

const app = new Hono<{ Bindings: Env }>();

app.get('/', authMiddlewareCheckOnly, (c) => getCurrentUser(c));
app.get('/likes', authMiddlewareCheckOnly, (c) => {
    const type = c.req.query('type');
    switch (type) {
        case 'comments':
            return getUserLikesOnComments(c);
        case 'subcomments':
            return getUserLikesOnSubcomments(c);
        case 'posts':
        default:
            return getUserLikesOnPosts(c);
    }
});
app.get('/communities', authMiddlewareCheckOnly, (c) => getUserCommunities(c));
app.get('/:username', (c) => getUserByUsername(c));

export default app;
