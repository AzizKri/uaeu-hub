-- Update views to include public_id fields

-- Drop and recreate user_view
DROP VIEW IF EXISTS user_view;
CREATE VIEW user_view AS
SELECT id,
       public_id,
       CASE
           WHEN is_deleted = true THEN 'DeletedUser'
           WHEN is_anonymous = true THEN 'Anonymous'
           ELSE username
           END AS username,
       CASE
           WHEN is_deleted = true THEN 'Deleted User'
           WHEN is_anonymous = true THEN 'Anonymous User'
           ELSE displayname
           END AS displayname,
       auth_provider,
       created_at,
       bio,
       pfp,
       is_anonymous,
       is_deleted
FROM user;

-- Drop and recreate post_view
DROP VIEW IF EXISTS post_view;
CREATE VIEW post_view AS
SELECT post.id,
       post.public_id,
       post.author_id,
       user.username       AS author,
       user.displayname    AS displayname,
       user.pfp            AS pfp,
       post.community_id,
       community.name      AS community,
       community.icon      AS community_icon,
       post.content,
       post.post_time,
       post.attachment,
       attachment.mimetype AS attachment_mime,
       attachment.metadata AS attachment_metadata,
       post.like_count,
       post.comment_count
FROM post
         JOIN user ON post.author_id = user.id
         LEFT JOIN community ON post.community_id = community.id
         LEFT JOIN attachment ON post.attachment = attachment.filename;

-- Drop and recreate comment_view
DROP VIEW IF EXISTS comment_view;
CREATE VIEW comment_view AS
SELECT comment.id,
       comment.public_id,
       comment.parent_post_id,
       comment.author_id,
       user.username    AS author,
       user.pfp         AS pfp,
       user.displayname AS displayname,
       comment.content,
       comment.post_time,
       comment.attachment,
       comment.like_count,
       comment.comment_count
FROM comment
         JOIN user ON comment.author_id = user.id;

-- Drop and recreate subcomment_view
DROP VIEW IF EXISTS subcomment_view;
CREATE VIEW subcomment_view AS
SELECT subcomment.id,
       subcomment.public_id,
       subcomment.parent_comment_id,
       subcomment.author_id,
       user.username    AS author,
       user.pfp         AS pfp,
       user.displayname AS displayname,
       subcomment.content,
       subcomment.post_time,
       subcomment.attachment,
       subcomment.like_count
FROM subcomment
         JOIN user ON subcomment.author_id = user.id;
