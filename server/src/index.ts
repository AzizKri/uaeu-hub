import { Hono } from 'hono';
import { cors } from 'hono/cors';
import v1 from './v1/index';
import user from './v2/routes/user';
import post from './v2/routes/post';
import attachment from './v2/routes/attachment';
import v3Index from './v3/v3.index';

const app = new Hono<{ Bindings: Env }>();

app.use(cors({
    origin: ['https://uaeu.chat', 'https://dev.uaeu.chat', 'https://osama.uaeu.chat', 'https://post-page.uaeu-hub.pages.dev', 'http://localhost:5173'],
    credentials: true
}));

app.all('/', (c) => c.text('OK', 200));
app.route('/v1', v1); // deprecated
app.route('/user', user);
app.route('/post', post);
app.route('/attachment', attachment);
app.route('/v3', v3Index)
app.get('/env', (c) => {
    const environment = c.env.ENVIRONMENT || 'production';
    console.log(environment)
    return c.text(environment)
})

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return app.fetch(request, env, ctx);
    },
    // @ts-ignore
    async scheduled(controller: ScheduledController, env: Env) {
        console.log('Running cron-triggered cleanup...');

        const MinutesAgo = Date.now() - (30 * 60 * 1000);

        try {
            const unreferencedAttachments = await env.DB.prepare(`
                SELECT filename, created_at
                FROM attachment
                WHERE created_at <= ?
                  AND NOT EXISTS (SELECT attachment FROM post WHERE attachment = filename)
            `).bind(MinutesAgo).all<AttachmentRow>();

            const attachments: string[] = [];
            const R2Attachments: string[] = [];

            for (const attachment of unreferencedAttachments.results) {
                const filename: string = attachment.filename;
                attachments.push(filename);
                R2Attachments.push(`attachments/${filename}`);
            }

            if (attachments.length === 0) {
                return new Response('No attachments to delete', { status: 200 });
            }

            await env.R2.delete(R2Attachments);
            console.log('Deleted from R2');
            await env.DB.prepare(`
                DELETE
                FROM attachment
                WHERE filename IN (${attachments.map(() => '?').join(',')})`
            ).bind(...attachments).run();
            console.log('Deleted from DB');

            console.log('Cron-triggered cleanup done');
            return new Response('Cron-triggered cleanup done', { status: 200 });
        } catch (e) {
            console.log('Cron-triggered cleanup failed');
            return new Response('Internal Server Error', { status: 500 });
        }
    }
};
