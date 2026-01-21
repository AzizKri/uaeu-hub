import { Context } from 'hono';
import { createPublicId } from '../util/nanoid';

// Create Bug Report
export async function createBugReport(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');

    // Only logged-in users can submit bug reports
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get data from validated json
    const {
        description,
        screenshot
        // @ts-ignore
    } = c.req.valid('json');

    const publicId = createPublicId();

    // Insert bug report into db
    await env.DB.prepare(`
        INSERT INTO bug_report (public_id, reporter_id, description, screenshot)
        VALUES (?, ?, ?, ?)
    `).bind(publicId, userId, description, screenshot || null).run();

    return c.json({ message: 'Bug report submitted', publicId, status: 201 }, 201);
}

// Create Feature Request
export async function createFeatureRequest(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');

    // Only logged-in users can submit feature requests
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get data from validated json
    const {
        description,
        screenshot
        // @ts-ignore
    } = c.req.valid('json');

    const publicId = createPublicId();

    // Insert feature request into db
    await env.DB.prepare(`
        INSERT INTO feature_request (public_id, reporter_id, description, screenshot)
        VALUES (?, ?, ?, ?)
    `).bind(publicId, userId, description, screenshot || null).run();

    return c.json({ message: 'Feature request submitted', publicId, status: 201 }, 201);
}

// Get Bug Reports (Admin only)
export async function getBugReports(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const status = c.req.query('status') || null;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    // Only logged-in users can view bug reports
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Check if global admin
    if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get bug reports with optional status filter
    let reports;
    if (status) {
        reports = await env.DB.prepare(`
            SELECT br.*, u.username as reporter_username
            FROM bug_report br
            LEFT JOIN user u ON br.reporter_id = u.id
            WHERE br.status = ?
            ORDER BY br.created_at DESC
            LIMIT 20 OFFSET ?
        `).bind(status, offset).all();
    } else {
        reports = await env.DB.prepare(`
            SELECT br.*, u.username as reporter_username
            FROM bug_report br
            LEFT JOIN user u ON br.reporter_id = u.id
            ORDER BY br.created_at DESC
            LIMIT 20 OFFSET ?
        `).bind(offset).all();
    }

    return c.json({ reports: reports.results }, 200);
}

// Get Feature Requests (Admin only)
export async function getFeatureRequests(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const status = c.req.query('status') || null;
    const offset = c.req.query('offset') ? Number(c.req.query('offset')) : 0;

    // Only logged-in users can view feature requests
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Check if global admin
    if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get feature requests with optional status filter
    let requests;
    if (status) {
        requests = await env.DB.prepare(`
            SELECT fr.*, u.username as reporter_username
            FROM feature_request fr
            LEFT JOIN user u ON fr.reporter_id = u.id
            WHERE fr.status = ?
            ORDER BY fr.created_at DESC
            LIMIT 20 OFFSET ?
        `).bind(status, offset).all();
    } else {
        requests = await env.DB.prepare(`
            SELECT fr.*, u.username as reporter_username
            FROM feature_request fr
            LEFT JOIN user u ON fr.reporter_id = u.id
            ORDER BY fr.created_at DESC
            LIMIT 20 OFFSET ?
        `).bind(offset).all();
    }

    return c.json({ requests: requests.results }, 200);
}

// Update Feedback Status (Admin only)
export async function updateFeedbackStatus(c: Context) {
    const env: Env = c.env;
    const userId = c.get('userId');
    const isAnonymous = c.get('isAnonymous');
    const type = c.req.param('type'); // 'bug' or 'feature'
    const id = c.req.param('id');

    // Only logged-in users can update feedback status
    if (!userId || isAnonymous) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Check if global admin
    if (!await isGlobalAdmin(env, userId)) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get data from validated json
    // @ts-ignore
    const { status } = c.req.valid('json');

    // Validate type
    if (type !== 'bug' && type !== 'feature') {
        return c.json({ message: 'Invalid feedback type', status: 400 }, 400);
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
        return c.json({ message: 'Invalid status', status: 400 }, 400);
    }

    const table = type === 'bug' ? 'bug_report' : 'feature_request';

    // Update status
    const result = await env.DB.prepare(`
        UPDATE ${table}
        SET status = ?
        WHERE id = ?
    `).bind(status, id).run();

    if (result.meta.changes === 0) {
        return c.json({ message: 'Feedback not found', status: 404 }, 404);
    }

    return c.json({ message: 'Status updated', status: 200 }, 200);
}

// Helper function to check if user is global admin
async function isGlobalAdmin(env: Env, userId: number) {
    const user = await env.DB.prepare(`
        SELECT is_admin
        FROM user
        WHERE id = ?
    `).bind(userId).first<{ is_admin: number }>();
    return !!(user?.is_admin);
}
