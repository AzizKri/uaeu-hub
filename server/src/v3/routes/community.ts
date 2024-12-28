import { Hono } from 'hono';
import { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';
import {
    createCommunity, getCommunitiesSortByActivity,
    getCommunitiesSortByCreation,
    getCommunitiesSortByMembers,
    getCommunity
} from '../controllers/community.controller';
import { validator } from 'hono/validator';
import { communitySchema } from '../util/validationSchemas';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

app.post('/',
    validator('form', (value, c) => {
        const parsed = communitySchema.safeParse(value);
        if (!parsed.success) {
            // if false positive, check the tags rule
            return c.text('Invalid community data', 400);
        }
        return parsed.data;
    }),
    (c) => createCommunity(c));
app.get('/getCommunities', async (c) => {
    const { sortBy } = c.req.query();
    switch (sortBy) {
        case 'latest':
            return await getCommunitiesSortByCreation(c);
        case 'activity':
            return await getCommunitiesSortByActivity(c);
        case 'members':
        default:
            return await getCommunitiesSortByMembers(c);
    }
})
app.get('/', (c) => getCommunity(c));

export default app;
