import { Hono } from 'hono';
import { cors } from 'hono/cors';
import v3Index from './v3/v3.index';
import { generateSalt, hashPassword } from './v3/util/crypto';
import { getOrCreateTags } from './v3/controllers/tags.controller';

const app = new Hono<{ Bindings: Env }>();

app.use(cors({
    origin: ['https://uaeu.chat', 'https://dev.uaeu.chat', 'https://osama.uaeu.chat', 'https://post-page.uaeu-hub.pages.dev', 'http://localhost:5173'],
    credentials: true
}));

app.all('/', (c) => c.text('OK', 200));
app.route('/', v3Index);
app.get('/env', (c) => {
    const environment = c.env.ENVIRONMENT || 'production';
    console.log(environment);
    return c.text(environment);
});
app.post('/init', async (c) => {
    const env: Env = c.env;

    // Validate request
    if (c.req.header('Authorization') !== `Bearer ${env.SYSTEM}`) return c.json({
        message: 'Unauthorized',
        status: 401
    }, 401);

    // Check if already initialized
    const system = await env.DB.prepare(`SELECT 1
                                         FROM user
                                         WHERE id = 0`).first<number>();
    if (system) return c.json({ message: 'Already initialized', status: 200 });

    // Create System User
    const password = env.SYSTEM;
    const { salt, encoded } = generateSalt();
    const hash = await hashPassword(password, salt);
    await env.DB.prepare(`
        INSERT INTO user (id, username, password, salt)
        VALUES (0, 'System', ?, ?)
    `).bind(hash, encoded).run();

    const tags = ['UAEU', 'Study', 'Gaming', 'Hobbies', 'Jobs'];
    // @ts-ignore
    c.set('tags', tags);
    const tagIds = await getOrCreateTags(c, true) as number[];

    // Create the community
    const community = await env.DB.prepare(
        `INSERT INTO community (id, name, description, icon, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING id`
    ).bind(0, 'general', 'This is the general community', null, tags.join(','), Date.now()).first<CommunityRow>();

    // Add tags to community
    await Promise.all(tagIds.map(async (tagId) => {
        await env.DB.prepare(`
            INSERT INTO community_tag (community_id, tag_id)
            VALUES (?, ?)
        `).bind(community!.id, tagId).run();
    }));

    // Create the roles
    // Administrator
    const adminRoleId = await env.DB.prepare(`
        INSERT INTO community_role (community_id, name, level, administrator)
        VALUES (?, 'Administrator', 100, true)
        RETURNING id
    `).bind(community!.id).first<CommunityRoleRow>();

    // Member
    await env.DB.prepare(`
        INSERT INTO community_role (community_id, name, level, read_posts, write_posts)
        VALUES (?, 'Member', 0, true, true)
        RETURNING id
    `).bind(community!.id).run();

    // Add the user as an administrator
    await env.DB.prepare(`
        INSERT INTO user_community (user_id, community_id, role_id, joined_at)
        VALUES (?, ?, ?, ?)
    `).bind(0, community!.id, adminRoleId!.id, Date.now()).run();

    return c.json(community, { status: 201 });
});

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return app.fetch(request, env, ctx);
    },
    // @ts-ignore
    async scheduled(controller: ScheduledController, env: Env) {
        console.log('Running cron-triggered cleanup...');

        try {
            const unreferencedAttachments = await env.DB.prepare(`
                SELECT filename, created_at
                FROM attachment
                WHERE created_at <= datetime('%s', 'now', '-1 day')
                  AND NOT EXISTS (SELECT attachment FROM post WHERE attachment = filename)
            `).all<AttachmentRow>();

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
