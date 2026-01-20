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
    searchUser, searchUserForCommunity, searchUserWithStatusInCommunity
} from '../controllers/user.controller';
import { firebaseAuthMiddlewareCheckOnly } from '../middleware';
import { validator } from 'hono/validator';
import { userEditingSchema } from '../util/validationSchemas';

const app = new Hono<{ Bindings: Env }>();

app.get('/', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCurrentUser(c));
app.get('/likes', firebaseAuthMiddlewareCheckOnly, (c: Context) => {
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
app.get('/communities', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCurrentUserCommunities(c));

app.get('/search', (c: Context) => {
    const communityId = c.req.query('communityId');
    if (communityId) {
        return searchUserForCommunity(c);
    } else {
        return searchUser(c)
    }
});
app.get('/searchWithStatusInCommunity', (c: Context) => searchUserWithStatusInCommunity(c));
app.get('/:userId/communities', firebaseAuthMiddlewareCheckOnly, (c: Context) => getUserCommunities(c));
app.get('/:username', (c: Context) => getUserByUsername(c));

app.post('/',
    validator('json', (value, c: Context) => {
        const parsed = userEditingSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }), firebaseAuthMiddlewareCheckOnly,
    (c: Context) => editCurrentUser(c));

export default app;
