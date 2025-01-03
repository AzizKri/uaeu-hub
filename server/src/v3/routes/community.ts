import { Hono } from 'hono';
import { JwtVariables } from 'hono/jwt';
import { authMiddleware } from '../util/middleware';
import {
    addMemberToCommunity, communityExists,
    createCommunity,
    deleteCommunity,
    editCommunity,
    getCommunitiesSortByActivity,
    getCommunitiesSortByCreation,
    getCommunitiesSortByMembers,
    getCommunityById,
    getCommunityByName, getCommunityMembers, joinCommunity, leaveCommunity,
    removeMemberFromCommunity
} from '../controllers/community.controller';
import { validator } from 'hono/validator';
import { communityEditingSchema, communitySchema } from '../util/validationSchemas';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use('/', authMiddleware);

// Create Community
app.post('/',
    validator('form', (value, c) => {
        const parsed = communitySchema.safeParse(value);
        if (!parsed.success) {
            return c.text('Invalid community data', 400);
        }
        return parsed.data;
    }),
    (c) => createCommunity(c));

// Community Memberships
app.post('/join/:id', (c) => joinCommunity(c));
app.post('/leave/:id', (c) => leaveCommunity(c));
app.get('/getMembers/:id', (c) => getCommunityMembers(c));
app.post('/addMember/:id/:userId', (c) => addMemberToCommunity(c));
app.delete('/removeMember/:id/:userId', (c) => removeMemberFromCommunity(c));

// Get Communities
app.get('/getCommunities', (c) => {
    const { sortBy } = c.req.query();
    switch (sortBy) {
        case 'latest':
            return getCommunitiesSortByCreation(c);
        case 'activity':
            return getCommunitiesSortByActivity(c);
        case 'members':
        default:
            return getCommunitiesSortByMembers(c);
    }
});
app.get('/getCommunityByName/:name', (c) => getCommunityByName(c));
app.get('/:id', (c) => getCommunityById(c));
app.get('/exists/:name', (c) => communityExists(c));

// Edit Community
app.post('/:id',
    validator('form', (value, c) => {
        const parsed = communityEditingSchema.safeParse(value);
        if (!parsed.success) {
            // if false positive, check the tags rule
            return c.text('Invalid community data', 400);
        }
        return parsed.data;
    }), (c) => editCommunity(c));

// Delete Community
app.delete('/:id', (c) => deleteCommunity(c));

export default app;
