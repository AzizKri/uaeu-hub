import { Context, Hono } from 'hono';
import { authMiddlewareCheckOnly } from '../middleware';
import {
    addAdminToCommunity,
    communityExists,
    createCommunity,
    deleteCommunity,
    editCommunity,
    getCommunitiesByTag,
    getCommunitiesByTags,
    getCommunitiesSortByActivity,
    getCommunitiesSortByCreation,
    getCommunitiesSortByMembers,
    getCommunityById,
    getCommunityByName,
    getCommunityMembers,
    getCommunityPostsBest,
    getCommunityPostsLatest,
    inviteUserToCommunity,
    joinCommunity,
    leaveCommunity,
    removeMemberFromCommunity,
    searchCommunities
} from '../controllers/community.controller';
import { validator } from 'hono/validator';
import { communityEditingSchema, communityInviteSchema, communitySchema } from '../util/validationSchemas';


const app = new Hono<{ Bindings: Env }>();

// Create Community
app.post('/',
    validator('form', (value, c: Context) => {
        const parsed = communitySchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => createCommunity(c));

// Community Memberships
app.post('/join/:id', authMiddlewareCheckOnly, (c: Context) => joinCommunity(c));
app.post('/leave/:id', authMiddlewareCheckOnly, (c: Context) => leaveCommunity(c));
app.post('/invite',
    validator('form', (value, c: Context) => {
        const parsed = communityInviteSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => inviteUserToCommunity(c));
app.get('/getMembers/:id', authMiddlewareCheckOnly, (c: Context) => getCommunityMembers(c));
// app.post('/addMember/:id/:userId', (c: Context) => addMemberToCommunity(c));
app.delete('/removeMember/:id/:userId', authMiddlewareCheckOnly, (c: Context) => removeMemberFromCommunity(c));

// Get Community Posts
app.get('/posts/:id', authMiddlewareCheckOnly, (c: Context) => {
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
app.get('/getCommunities', authMiddlewareCheckOnly, (c: Context) => {
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
app.get('/getCommunitiesByTag', authMiddlewareCheckOnly, (c: Context) => getCommunitiesByTag(c));
app.get('/getCommunitiesByTags', authMiddlewareCheckOnly, (c: Context) => getCommunitiesByTags(c));
app.get('/searchCommunities', authMiddlewareCheckOnly, (c: Context) => searchCommunities(c));
app.get('/getCommunityByName/:name', authMiddlewareCheckOnly, (c: Context) => getCommunityByName(c));
app.get('/:id', authMiddlewareCheckOnly, (c: Context) => getCommunityById(c));
app.get('/exists/:name', (c: Context) => communityExists(c));

// Edit Community
app.post('/:id',
    validator('form', (value, c: Context) => {
        const parsed = communityEditingSchema.safeParse(value);
        if (!parsed.success) {
            // if false positive, check the tags rule
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => editCommunity(c));
app.post('/addAdmin',
    validator('form', (value, c: Context) => {
        const parsed = communityInviteSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    authMiddlewareCheckOnly,
    (c: Context) => addAdminToCommunity(c));

// Delete Community
app.delete('/:id', authMiddlewareCheckOnly, (c: Context) => deleteCommunity(c));

export default app;
