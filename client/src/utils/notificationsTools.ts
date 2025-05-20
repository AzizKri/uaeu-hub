export function getNotificationLink (notification: Notification) {
    switch (notification.type) {
        case 'like':
        { const metadata = notification.metadata as LikeMetadata;
            return `/post/${metadata.entityId}`; }
        case 'comment':
        { const metadata = notification.metadata as CommentMetadata;
            return `/post/${metadata.parentPostId}`; }
        case 'subcomment':
        {  const metadata = notification.metadata as SubcommentMetadata;
            return `/post/${metadata.parentPostId}`; }
        case 'invite':
        {  const metadata = notification.metadata as InvitationMetadata;
            const link = metadata.communityName.split(" ").join("%20");
            return `/community/${link}`; }
        default:
            return '#';
    }
};

export function getMessage(notification: Notification) {
    switch (notification.type) {
        case 'like':
            return ` liked your post!`;
        case 'comment':
            return ` commented on your post!`;
        case 'subcomment':
            return ` replied to your comment!`;
        case 'invite':
            return ` invited you to '${"communityName" in notification.metadata ? notification.metadata.communityName : ""}'`;
        default:
            return '#';
    }
};
