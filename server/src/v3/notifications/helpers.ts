export async function getEntityAuthorId(
    env: Env,
    entityId: number,
    entityType: 'post' | 'comment' | 'subcomment'
): Promise<number> {
    switch (entityType) {
        case 'post':
            const pE = await env.DB.prepare(`
                SELECT author_id
                FROM post
                WHERE id = ?
            `).bind(entityId).first<PostRow>();
            if (!pE) throw new Error('Invalid entity ID');
            return pE.author_id;
        case 'comment':
            const cE = await env.DB.prepare(`
                SELECT author_id
                FROM comment
                WHERE id = ?
            `).bind(entityId).first<CommentRow>();
            if (!cE) throw new Error('Invalid entity ID');
            return cE.author_id;
        case 'subcomment':
            const scE = await env.DB.prepare(`
                SELECT author_id
                FROM subcomment
                WHERE id = ?
            `).bind(entityId).first<SubcommentRow>();
            if (!scE) throw new Error('Invalid entity ID');
            return scE.author_id;
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
