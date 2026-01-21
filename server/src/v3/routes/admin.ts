import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware } from '../middleware';
import {
    getAdminStats,
    getUsers,
    suspendUser,
    banUser,
    unbanUser,
    unsuspendUser,
} from '../controllers/admin.controller';

const app = new Hono<{ Bindings: Env }>();

// All admin routes require Firebase authentication
app.use('/*', firebaseAuthMiddleware);

// Dashboard stats
app.get('/stats', (c: Context) => getAdminStats(c));

// User management
app.get('/users', (c: Context) => getUsers(c));
app.post('/users/:userId/suspend', (c: Context) => suspendUser(c));
app.post('/users/:userId/ban', (c: Context) => banUser(c));
app.post('/users/:userId/unban', (c: Context) => unbanUser(c));
app.post('/users/:userId/unsuspend', (c: Context) => unsuspendUser(c));

export default app;
