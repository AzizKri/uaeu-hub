import { Context, Hono } from 'hono';
import { firebaseAuthMiddlewareCheckOnly } from '../middleware';
import {
    createReport,
    getReport,
    getReports,
    getReportsForCommunity,
    resolveReport,
    takeReportAction,
    getReportsWithDetails
} from '../controllers/report.controller';
import { validator } from 'hono/validator';
import { reportActionParamSchema, reportActionSchema, reportSchema, resolveReportSchema } from '../util/validationSchemas';
import { validationError } from '../util/requestValidation';

const app = new Hono<{ Bindings: Env }>();

app.post('/',
    validator('json', (value, c: Context) => {
        const parsed = reportSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => createReport(c)
);
app.post('/resolve',
    validator('json', (value, c: Context) => {
        const parsed = resolveReportSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => resolveReport(c)
);

// Admin-only routes (must come before parameterized routes)
app.get('/admin/all', firebaseAuthMiddlewareCheckOnly, (c: Context) => getReportsWithDetails(c));
app.post('/:reportId/action',
    validator('param', (value, c: Context) => {
        const parsed = reportActionParamSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    validator('json', (value, c: Context) => {
        const parsed = reportActionSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => takeReportAction(c)
);
app.get('/community/:communityId', firebaseAuthMiddlewareCheckOnly, (c: Context) => getReportsForCommunity(c));
app.get('/:reportId', firebaseAuthMiddlewareCheckOnly, (c: Context) => getReport(c));
app.get('/', firebaseAuthMiddlewareCheckOnly, (c: Context) => getReports(c));

export default app;
