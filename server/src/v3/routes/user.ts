import { Hono } from 'hono';
import {
    editUser,
    getCurrentUser,
    getUserByUsername,
    getUserCommunities,
    getUserLikesOnComments,
    getUserLikesOnPosts,
    getUserLikesOnSubcomments
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
app.post('/', validator('form', (value, c) => {
    const parsed = userEditingSchema.safeParse(value);
    if (!parsed.success) {
        return c.text('Invalid user data', 400);
    }
    return parsed.data;
}), (c) => editUser(c));

export default app;
