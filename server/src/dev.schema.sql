PRAGMA foreign_keys = on;

CREATE TABLE IF NOT EXISTS user
(
    username    TEXT PRIMARY KEY,
    displayname TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    password    TEXT    NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    bio         TEXT,
    pfp         TEXT
);

CREATE VIEW IF NOT EXISTS user_view AS
SELECT username, displayname, created_at, bio, pfp
FROM user;

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
    author        TEXT    NOT NULL,
    content       TEXT    NOT NULL,
    post_time     INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attachment    TEXT,
    like_count    INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (author) REFERENCES user (username) ON DELETE SET NULL,
    FOREIGN KEY (attachment) REFERENCES attachment (filename) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comment
(
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_post_id INTEGER NOT NULL,
    author         TEXT    NOT NULL,
    content        TEXT    NOT NULL,
    post_time      INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attachment     TEXT,
    like_count     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (parent_post_id) REFERENCES post (id) ON DELETE CASCADE,
    FOREIGN KEY (author) REFERENCES user (username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes
(
    post_id INTEGER NOT NULL,
    user    TEXT    NOT NULL,
    PRIMARY KEY (post_id, user),
    FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE,
    FOREIGN KEY (user) REFERENCES user (username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_likes
(
    comment_id INTEGER NOT NULL,
    user       TEXT    NOT NULL,
    PRIMARY KEY (comment_id, user),
    FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE,
    FOREIGN KEY (user) REFERENCES user (username) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE posts_fts USING fts5
(
    content,
    author,
    tokenize = 'porter',
    prefix = '2 3 4'
);

CREATE INDEX idx_post_author ON post (author);

CREATE INDEX idx_comment_author ON comment (author);
CREATE INDEX idx_comment_parent_post_id ON comment (parent_post_id);

CREATE INDEX idx_post_likes_post_id ON post_likes (post_id);
CREATE INDEX idx_post_likes_user ON post_likes (user);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes (comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes (user);

INSERT INTO posts_fts(rowid, content, author)
SELECT id, content, author
FROM post;

CREATE TRIGGER post_created
    AFTER INSERT
    ON post
BEGIN
    INSERT INTO posts_fts(rowid, content, author)
    VALUES (new.id, new.content, new.author);
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
