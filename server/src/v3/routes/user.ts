import { Hono } from 'hono';
import {
    editCurrentUser,
    getCurrentUser,
    getCurrentUserCommunities,
    getCurrentUserLikesOnComments,
    getCurrentUserLikesOnPosts,
    getCurrentUserLikesOnSubcomments,
    getUserByUsername,
    getUserCommunities,
    searchUser
} from '../controllers/user.controller';
import { authMiddlewareCheckOnly } from '../util/middleware';
import { validator } from 'hono/validator';
import { userEditingSchema } from '../util/validationSchemas';

const app = new Hono<{ Bindings: Env }>();

app.get('/', authMiddlewareCheckOnly, (c) => getCurrentUser(c));
app.get('/likes', authMiddlewareCheckOnly, (c) => {
    const type = c.req.query('type');
    switch (type) {
        case 'comments':
            return getCurrentUserLikesOnComments(c);
        case 'subcomments':
            return getCurrentUserLikesOnSubcomments(c);
        case 'posts':
        default:
            return getCurrentUserLikesOnPosts(c);
    }
});
app.get('/communities', authMiddlewareCheckOnly, (c) => getCurrentUserCommunities(c));

app.get('/search', (c) => searchUser(c));
app.get('/:userId/communities', authMiddlewareCheckOnly, (c) => getUserCommunities(c));
app.get('/:username', (c) => getUserByUsername(c));

app.post('/',
    validator('form', (value, c) => {
        const parsed = userEditingSchema.safeParse(value);
        if (!parsed.success) {
            return c.text('Invalid user data', 400);
        }
        return parsed.data;
    }), authMiddlewareCheckOnly,
    (c) => editCurrentUser(c));

export default app;
