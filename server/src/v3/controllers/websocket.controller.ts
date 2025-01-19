import { Context } from 'hono';
import { validateWebSocketIdSignature } from '../util/crypto';

export async function createWebSocketEntry(c: Context) {
    // Check for userId. We don't need to create a websocket if there's no user
    const userId = c.get('userId') as number;
    if (!userId) return c.json({}, 200);

    const env: Env = c.env;
    const formData = await c.req.parseBody();
    const uuid = formData['uuid'] as string;
    const signature = formData['signature'] as string;
    const timestamp = formData['timestamp'] as string;
    const nonce = formData['nonce'] as string;

    // Check if data is provided
    if (!uuid || !signature || !timestamp || !nonce) return c.json({ message: 'Bad Request', status: 400 }, 400);

    // Validate signature
    if (!await validateWebSocketIdSignature(uuid, timestamp, nonce, signature, env.WS_SECRET)) {
        return c.json({ message: 'Unauthorized', status: 401 }, 401);
    }

    try {
        // Insert WebSocket entry
        await env.DB.prepare(`
            INSERT INTO websocket (socket_id, user_id)
            VALUES (?, ?)
        `).bind(uuid, userId).run();

        return c.json({ message: 'WebSocket Entry created', status: 200 }, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function getUserIdFromWebSocketId(c: Context) {
    const env: Env = c.env;
    const uuid = c.req.param('uuid');

    try {
        // Get UserId from UUID
        const websocket = await env.DB.prepare(`
            SELECT *
            FROM websocket
            WHERE socket_id = ?
        `).bind(uuid).first<WebSocketRow>();

        if (!websocket || websocket.used || (Date.now() / 1000) - websocket.created_at > 300) return c.json({
            message: 'Unauthorized',
            status: 401
        }, 401);

        // Mark the websocket as used
        await env.DB.prepare(`
            UPDATE websocket
            SET used = true
            WHERE socket_id = ?
        `).bind(uuid).run();

        return c.json({ userId: websocket.user_id }, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}

export async function deleteWebSocketEntry(c: Context) {
    // Check for userId. Can't delete a websocket if there's no user
    const userId = c.get('userId') as number;
    if (!userId) return c.json({ message: 'Unauthorized', status: 401 }, 401);

    // Get required params
    const env: Env = c.env;
    const uuid = c.req.param('uuid');

    // Check if UUID is provided
    if (!uuid) return c.json({ message: 'Bad Request', status: 400 }, 400);

    try {
        // Attempt to delete WebSocket entry
        const result = await env.DB.prepare(`
            DELETE FROM websocket
            WHERE socket_id = ?
            AND user_id = ?
        `).bind(uuid, userId).first<WebSocketRow>();

        if (!result) return c.json({ message: 'Failed to delete WebSocket entry', status: 400 }, 400);

        return c.json({ message: 'WebSocket Entry deleted', status: 200 }, 200);
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Internal Server Error', status: 500 }, 500);
    }
}
