import { Context, Hono } from 'hono';
import { firebaseAuthMiddlewareCheckOnly } from '../middleware';
import {
    createBugReport,
    createFeatureRequest,
    getBugReports,
    getFeatureRequests,
    updateFeedbackStatus
} from '../controllers/feedback.controller';
import { validator } from 'hono/validator';
import { feedbackSchema, feedbackStatusSchema } from '../util/validationSchemas';

const app = new Hono<{ Bindings: Env }>();

// Create bug report
app.post('/bug',
    validator('json', (value, c: Context) => {
        const parsed = feedbackSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => createBugReport(c)
);

// Create feature request
app.post('/feature',
    validator('json', (value, c: Context) => {
        const parsed = feedbackSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => createFeatureRequest(c)
);

// Get all bug reports (admin only)
app.get('/bugs', firebaseAuthMiddlewareCheckOnly, (c: Context) => getBugReports(c));

// Get all feature requests (admin only)
app.get('/features', firebaseAuthMiddlewareCheckOnly, (c: Context) => getFeatureRequests(c));

// Update feedback status (admin only)
app.patch('/:type/:id',
    validator('json', (value, c: Context) => {
        const parsed = feedbackStatusSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => updateFeedbackStatus(c)
);

export default app;
