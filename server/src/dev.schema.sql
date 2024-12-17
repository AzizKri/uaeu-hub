PRAGMA foreign_keys = on;

CREATE TABLE IF NOT EXISTS user
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    displayname   TEXT,
    email         TEXT,
    auth_provider TEXT    NOT NULL DEFAULT 'local',
    password      TEXT,
    salt          TEXT,
    google_id     TEXT,
    created_at    INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    bio           TEXT,
    pfp           TEXT,
    is_anonymous  BOOLEAN          DEFAULT FALSE,
    deleted       BOOLEAN          DEFAULT FALSE
);

CREATE VIEW IF NOT EXISTS user_view AS
SELECT id,
       CASE
           WHEN deleted = true THEN 'DeletedUser'
           WHEN is_anonymous = true THEN 'Anonymous'
           ELSE username
           END AS username,
       CASE
           WHEN deleted = true THEN 'Deleted User'
           WHEN is_anonymous = true THEN 'Anonymous User'
           ELSE displayname
           END AS displayname,
       auth_provider,
       created_at,
       bio,
       pfp,
       is_anonymous
FROM user;

CREATE TABLE IF NOT EXISTS session
(
    id         TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT,
    icon        TEXT,
    verified    BOOLEAN NOT NULL DEFAULT FALSE,
    invite_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tags        TEXT
);

CREATE TABLE IF NOT EXISTS user_community
(
    user_id      INTEGER NOT NULL,
    community_id INTEGER NOT NULL,
    join_date    INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role         TEXT    NOT NULL DEFAULT 'member',
    PRIMARY KEY (user_id, community_id),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES community (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS badge
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    icon        TEXT,
    awarded     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badge
(
    user_id    INTEGER NOT NULL,
    badge_id   INTEGER NOT NULL,
    awarded_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badge (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attachment
(
    filename   TEXT PRIMARY KEY,
    mimetype   TEXT    NOT NULL,
    metadata   TEXT,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id     INTEGER NOT NULL DEFAULT -1,
    community_id  INTEGER,
    content       TEXT    NOT NULL,
    post_time     INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attachment    TEXT,
    like_count    INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES user (id) ON DELETE SET DEFAULT,
    FOREIGN KEY (attachment) REFERENCES attachment (filename) ON DELETE SET NULL,
    FOREIGN KEY (community_id) REFERENCES community (id) ON DELETE SET NULL
);

CREATE VIEW IF NOT EXISTS post_view AS
SELECT post.id,
       post.author_id,
       user.username  AS author,
       user.pfp       AS pfp,
       post.community_id,
       community.name AS community,
       community.icon AS community_icon,
       post.content,
       post.post_time,
       post.attachment,
       post.like_count,
       post.comment_count
FROM post
         JOIN user ON post.author_id = user.id
         JOIN community ON post.community_id = community.id;

CREATE TABLE IF NOT EXISTS comment
(
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_post_id INTEGER NOT NULL,
    author_id      INTEGER NOT NULL,
    content        TEXT    NOT NULL,
    post_time      INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attachment     TEXT,
    like_count     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (parent_post_id) REFERENCES post (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE VIEW IF NOT EXISTS comment_view AS
SELECT comment.id,
       user.username AS author,
       user.pfp      AS pfp,
       comment.content,
       comment.post_time,
       comment.attachment,
       comment.like_count
FROM comment
         JOIN user ON comment.author_id = user.id;

CREATE TABLE IF NOT EXISTS post_likes
(
    post_id INTEGER NOT NULL,
    user_id TEXT    NOT NULL,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_views
(
    post_id INTEGER NOT NULL,
    user_id TEXT    NOT NULL,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_likes
(
    comment_id INTEGER NOT NULL,
    user_id    TEXT    NOT NULL,
    PRIMARY KEY (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE posts_fts USING fts5
(
    title,
    content,
    author,
    tokenize = 'porter',
    prefix = '2 3 4'
);

CREATE INDEX idx_user_username ON user (username);

CREATE INDEX idx_post_author_id ON post (author_id);

CREATE INDEX idx_comment_author_id ON comment (author_id);
CREATE INDEX idx_comment_parent_post_id ON comment (parent_post_id);

CREATE INDEX idx_post_likes_post_id ON post_likes (post_id);
CREATE INDEX idx_post_likes_user ON post_likes (user_id);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes (comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes (user_id);

INSERT INTO posts_fts(rowid, content, author)
SELECT id, content, (SELECT username FROM user WHERE user.id = post.author_id)
FROM post;

CREATE TRIGGER post_created
    AFTER INSERT
    ON post
BEGIN
    INSERT INTO posts_fts(rowid, content, author)
    VALUES (new.id, new.content, (SELECT username FROM user WHERE user.id = new.author_id));
END;

CREATE TRIGGER post_deleted
    AFTER DELETE
    ON post
BEGIN
    DELETE
    FROM posts_fts
    WHERE rowid = old.id;
END;

CREATE TRIGGER increment_post_like_count
    AFTER INSERT
    ON post_likes
BEGIN
    UPDATE post
    SET like_count = like_count + 1
    WHERE id = new.post_id;
END;

CREATE TRIGGER decrement_post_like_count
    AFTER DELETE
    ON post_likes
BEGIN
    UPDATE post
    SET like_count = like_count - 1
    WHERE id = old.post_id;
END;

CREATE TRIGGER increment_comment_like_count
    AFTER INSERT
    ON comment_likes
BEGIN
    UPDATE comment
    SET like_count = like_count + 1
    WHERE id = new.comment_id;
END;

CREATE TRIGGER decrement_comment_like_count
    AFTER DELETE
    ON comment_likes
BEGIN
    UPDATE comment
    SET like_count = like_count - 1
    WHERE id = old.comment_id;
END;

CREATE TRIGGER increment_post_comment_count
    AFTER INSERT
    ON comment
BEGIN
    UPDATE post
    SET comment_count = comment_count + 1
    WHERE id = new.parent_post_id;
END;

CREATE TRIGGER decrement_post_comment_count
    AFTER DELETE
    ON comment
BEGIN
    UPDATE post
    SET comment_count = comment_count - 1
    WHERE id = old.parent_post_id;
END;
