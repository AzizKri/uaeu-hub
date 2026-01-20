import { Context, Hono } from 'hono';
import { firebaseAuthMiddlewareCheckOnly } from '../middleware';
import {
    createReport,
    getReport,
    getReports,
    getReportsForCommunity,
    resolveReport
} from '../controllers/report.controller';
import { validator } from 'hono/validator';
import { reportSchema, resolveReportSchema } from '../util/validationSchemas';

const app = new Hono<{ Bindings: Env }>();

app.post('/',
    validator('json', (value, c: Context) => {
        const parsed = reportSchema.safeParse(value);
        if (!parsed.success) {
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
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
            const errors = parsed.error.errors.map(err => ({ field: err.path[0], message: err.message }));
            return c.json({ errors }, 400);
        }
        return parsed.data;
    }),
    firebaseAuthMiddlewareCheckOnly,
    (c: Context) => resolveReport(c)
);

app.get('/:communityId', firebaseAuthMiddlewareCheckOnly, (c: Context) => getReportsForCommunity(c));
app.get('/:reportId', firebaseAuthMiddlewareCheckOnly, (c: Context) => getReport(c));
app.get('/', firebaseAuthMiddlewareCheckOnly, (c: Context) => getReports(c));

export default app;
