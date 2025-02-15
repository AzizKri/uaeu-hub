import { Context, Hono } from 'hono';
import { authMiddlewareCheckOnly } from '../middleware';
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
    authMiddlewareCheckOnly,
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
    authMiddlewareCheckOnly,
    (c: Context) => resolveReport(c)
);

app.get('/:communityId', authMiddlewareCheckOnly, (c: Context) => getReportsForCommunity(c));
app.get('/:reportId', authMiddlewareCheckOnly, (c: Context) => getReport(c));
app.get('/', authMiddlewareCheckOnly, (c: Context) => getReports(c));

export default app;
