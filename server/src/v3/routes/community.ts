import { Context, Hono } from 'hono';
import { firebaseAuthMiddlewareCheckOnly } from '../middleware';
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
    rejectInvitation,
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
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => createCommunity(c));

// Community Memberships
app.post('/join/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => joinCommunity(c));
app.post('/rejectInvitation/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => rejectInvitation(c));
app.post('/leave/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => leaveCommunity(c));
app.post('/invite',
    validator('form', (value, c: Context) => {
        const parsed = communityInviteSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => inviteUserToCommunity(c));
app.get('/getMembers/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommunityMembers(c));
// app.post('/addMember/:id/:userId', (c: Context) => addMemberToCommunity(c));
app.delete('/removeMember/:id/:userId', firebaseAuthMiddlewareCheckOnly, (c: Context) => removeMemberFromCommunity(c));

// Get Community Posts
app.get('/posts/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => {
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
app.get('/getCommunities', firebaseAuthMiddlewareCheckOnly, (c: Context) => {
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
app.get('/getCommunitiesByTag', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommunitiesByTag(c));
app.get('/getCommunitiesByTags', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommunitiesByTags(c));
app.get('/searchCommunities', firebaseAuthMiddlewareCheckOnly, (c: Context) => searchCommunities(c));
app.get('/getCommunityByName/:name', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommunityByName(c));
app.get('/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommunityById(c));
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
    firebaseAuthMiddlewareCheckOnly,
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
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => addAdminToCommunity(c));

// Delete Community
app.delete('/:id', firebaseAuthMiddlewareCheckOnly, (c: Context) => deleteCommunity(c));

export default app;
