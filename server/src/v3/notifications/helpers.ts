export async function getEntity(
    env: Env,
    entityId: number,
    entityType: 'post' | 'comment' | 'subcomment'
): Promise<PostRow | CommentRow | SubcommentRow> {
    switch (entityType) {
        case 'post':
            const pE = await env.DB.prepare(`
                SELECT author_id, content
                FROM post
                WHERE id = ?
            `).bind(entityId).first<PostRow>();
            if (!pE) throw new Error('Invalid entity ID');
            return pE;
        case 'comment':
            const cE = await env.DB.prepare(`
                SELECT author_id, content
                FROM comment
                WHERE id = ?
            `).bind(entityId).first<CommentRow>();
            if (!cE) throw new Error('Invalid entity ID');
            return cE;
        case 'subcomment':
            const scE = await env.DB.prepare(`
                SELECT author_id, content
                FROM subcomment
                WHERE id = ?
            `).bind(entityId).first<SubcommentRow>();
            if (!scE) throw new Error('Invalid entity ID');
            return scE;
        default:
            throw new Error('Invalid entity type');
    }
}

export async function sendToWebSocket(env: Env, payload: NotificationPayload.default) {
    try {
        const request = await fetch(env.WEBSOCKET_URL + '/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log(request, 'Notification sent');
    } catch (e) {
        console.error(e);
        throw new Error('Failed to send notification');
    }
}
