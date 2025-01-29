import { Context, Hono } from 'hono';
import {
    editCurrentUser,
    getCurrentUser,
    getCurrentUserCommunities,
    getCurrentUserLikesOnComments,
    getCurrentUserLikesOnPosts,
    getCurrentUserLikesOnSubcomments,
    getUserByUsername,
    getUserCommunities,
    searchUser, searchUserForCommunity
} from '../controllers/user.controller';
import { authMiddlewareCheckOnly } from '../middleware';
import { validator } from 'hono/validator';
import { userEditingSchema } from '../util/validationSchemas';

const app = new Hono<{ Bindings: Env }>();

app.get('/', authMiddlewareCheckOnly, (c: Context) => getCurrentUser(c));
app.get('/likes', authMiddlewareCheckOnly, (c: Context) => {
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
app.get('/communities', authMiddlewareCheckOnly, (c: Context) => getCurrentUserCommunities(c));

app.get('/search', (c: Context) => {
    const communityId = c.req.query('communityId');
    if (communityId) {
        return searchUserForCommunity(c);
    } else {
        return searchUser(c)
    }
});
app.get('/:userId/communities', authMiddlewareCheckOnly, (c: Context) => getUserCommunities(c));
app.get('/:username', (c: Context) => getUserByUsername(c));

app.post('/',
    validator('json', (value, c: Context) => {
        const parsed = userEditingSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }), authMiddlewareCheckOnly,
    (c: Context) => editCurrentUser(c));

export default app;
