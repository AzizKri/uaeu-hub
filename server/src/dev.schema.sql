DROP TABLE comment;
DROP TABLE post;
DROP TABLE user;

CREATE TABLE IF NOT EXISTS user (
	username TEXT PRIMARY KEY,
	displayname TEXT NOT NULL,
	email TEXT NOT NULL,
	created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	bio TEXT,
	pfp TEXT
);

CREATE TABLE IF NOT EXISTS post (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	author TEXT NOT NULL,
	content TEXT NOT NULL,
	post_time INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (author) REFERENCES user(username)
);

CREATE TABLE IF NOT EXISTS comment (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	parent_post_id INTEGER NOT NULL,
	author TEXT NOT NULL,
	content TEXT NOT NULL,
	post_time INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (parent_post_id) REFERENCES post(id),
	FOREIGN KEY (author) REFERENCES user(username)
);

CREATE TABLE IF NOT EXISTS post_likes (
	post_id INTEGER NOT NULL,
	user TEXT NOT NULL,
	PRIMARY KEY (post_id, user),
	FOREIGN KEY (post_id) REFERENCES post(id),
	FOREIGN KEY (user) REFERENCES user(username)
);

CREATE TABLE IF NOT EXISTS comment_likes (
	comment_id INTEGER NOT NULL,
	username TEXT NOT NULL,
	PRIMARY KEY (comment_id, username),
	FOREIGN KEY (comment_id) REFERENCES comment(id),
	FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE IF NOT EXISTS attachment (
	post_id INTEGER NOT NULL,
	filename TEXT NOT NULL,
	mimetype TEXT NOT NULL,
	metadata TEXT,
	PRIMARY KEY (post_id, filename),
	FOREIGN KEY (post_id) REFERENCES post(id)
);
