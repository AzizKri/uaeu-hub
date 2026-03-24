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
import { validator } from 'hono/validator';
import { adminBanSchema, adminSuspendSchema, adminTargetParamSchema } from '../util/validationSchemas';
import { validationError } from '../util/requestValidation';

const app = new Hono<{ Bindings: Env }>();

// All admin routes require Firebase authentication
app.use('/*', firebaseAuthMiddleware);

// Dashboard stats
app.get('/stats', (c: Context) => getAdminStats(c));

// User management
app.get('/users', (c: Context) => getUsers(c));
app.post('/users/:userId/suspend',
    validator('param', (value, c: Context) => {
        const parsed = adminTargetParamSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    validator('json', (value, c: Context) => {
        const parsed = adminSuspendSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    (c: Context) => suspendUser(c)
);
app.post('/users/:userId/ban',
    validator('param', (value, c: Context) => {
        const parsed = adminTargetParamSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    validator('json', (value, c: Context) => {
        const parsed = adminBanSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    (c: Context) => banUser(c)
);
app.post('/users/:userId/unban',
    validator('param', (value, c: Context) => {
        const parsed = adminTargetParamSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    (c: Context) => unbanUser(c)
);
app.post('/users/:userId/unsuspend',
    validator('param', (value, c: Context) => {
        const parsed = adminTargetParamSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    (c: Context) => unsuspendUser(c)
);

export default app;
