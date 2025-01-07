import { Hono } from 'hono';
import { JwtVariables } from 'hono/jwt';
import { authMiddlewareCheckOnly } from '../util/middleware';
import {
    communityExists,
    createCommunity,
    deleteCommunity,
    editCommunity,
    getCommunitiesByTag,
    getCommunitiesSortByActivity,
    getCommunitiesSortByCreation,
    getCommunitiesSortByMembers,
    getCommunityById,
    getCommunityByName,
    getCommunityMembers,
    getCommunityPostsBest,
    getCommunityPostsLatest,
    joinCommunity,
    leaveCommunity,
    removeMemberFromCommunity,
    searchCommunities
} from '../controllers/community.controller';
import { validator } from 'hono/validator';
import { communityEditingSchema, communitySchema } from '../util/validationSchemas';

type Variables = JwtVariables

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

// Create Community
app.post('/',
    validator('form', (value, c) => {
        const parsed = communitySchema.safeParse(value);
        if (!parsed.success) {
            return c.text('Invalid community data', 400);
        }
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c) => createCommunity(c));

// Community Memberships
app.post('/join/:id', authMiddlewareCheckOnly, (c) => joinCommunity(c));
app.post('/leave/:id', authMiddlewareCheckOnly, (c) => leaveCommunity(c));
app.get('/getMembers/:id', authMiddlewareCheckOnly, (c) => getCommunityMembers(c));
// app.post('/addMember/:id/:userId', (c) => addMemberToCommunity(c));
app.delete('/removeMember/:id/:userId', authMiddlewareCheckOnly, (c) => removeMemberFromCommunity(c));

// Get Community Posts
app.get('/posts/:id', authMiddlewareCheckOnly, (c) => {
    const { sortBy } = c.req.query();
    switch (sortBy) {
        case 'best':
            return getCommunityPostsBest(c);
        case 'latest':
        default:
            return getCommunityPostsLatest(c);
    }
});

// Get Communities
app.get('/getCommunities', authMiddlewareCheckOnly, (c) => {
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
app.get('/getCommunitiesByTag', authMiddlewareCheckOnly, (c) => getCommunitiesByTag(c));
app.get('/searchCommunities', authMiddlewareCheckOnly, (c) => searchCommunities(c));
app.get('/getCommunityByName/:name', authMiddlewareCheckOnly, (c) => getCommunityByName(c));
app.get('/:id', authMiddlewareCheckOnly, (c) => getCommunityById(c));
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
    }),
    authMiddlewareCheckOnly,
    (c) => editCommunity(c));

// Delete Community
app.delete('/:id', authMiddlewareCheckOnly, (c) => deleteCommunity(c));

export default app;
