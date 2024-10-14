PRAGMA foreign_keys = on;
PRAGMA defer_foreign_keys = off;

DROP TABLE comment_likes;
DROP TABLE post_likes;
DROP TABLE comment;
DROP TABLE post;
DROP TABLE user;
DROP TABLE attachment;

CREATE TABLE IF NOT EXISTS user
(
	username    TEXT PRIMARY KEY,
	displayname TEXT    NOT NULL,
	email       TEXT    NOT NULL,
	created_at  INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	bio         TEXT,
	pfp         TEXT
);

CREATE TABLE IF NOT EXISTS attachment
(
	filename TEXT PRIMARY KEY,
	mimetype TEXT NOT NULL,
	metadata TEXT
);

CREATE TABLE IF NOT EXISTS post
(
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	author     TEXT    NOT NULL,
	content    TEXT    NOT NULL,
	post_time  INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	attachment TEXT,
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
	FOREIGN KEY (parent_post_id) REFERENCES post (id) ON DELETE SET NULL,
	FOREIGN KEY (author) REFERENCES user (username) ON DELETE SET NULL
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
	username   TEXT    NOT NULL,
	PRIMARY KEY (comment_id, username),
	FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE,
	FOREIGN KEY (username) REFERENCES user (username) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE posts_fts USING fts5
(
	content,
	author,
	tokenize = 'porter'
);

INSERT INTO posts_fts(rowid, content, author)
SELECT id, content, author
FROM post;

-- Run triggers on CF D1 console
CREATE TRIGGER post_created
	AFTER INSERT
	ON post
BEGIN
	INSERT INTO posts_fts(rowid, content, author)
	VALUES (new.id, new.content, new.author);
END;
