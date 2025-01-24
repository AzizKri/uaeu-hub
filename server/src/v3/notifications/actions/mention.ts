import { getEntity, sendToWebSocket } from '../helpers';

export async function handleMention(env: Env, {
    senderId,
    receiverId,
    entityId,
    entityType
}: NotificationPayload.Mention) {
    // Rename subcomment to reply
    let mentionMessage: string | undefined = undefined;
    if (entityType === 'subcomment') mentionMessage = `reply`;

    const { content } = await getEntity(env, entityId, entityType);

    const invitePayload: NotificationPayload.default = {
        senderId,
        receiverId,
        action: 'invite',
        entityId: entityId,
        entityType: entityType,
        message: `{user.${senderId}} has mentioned you in a ${mentionMessage || entityType}!{${entityType}.${entityId}!}`,
        content
    };
    await sendToWebSocket(env, invitePayload);
}
