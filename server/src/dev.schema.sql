DROP TABLE comments;
DROP TABLE posts;
DROP TABLE users;

CREATE TABLE IF NOT EXISTS users (
	username TEXT PRIMARY KEY,
	displayname TEXT NOT NULL,
	email TEXT NOT NULL,
	created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	bio TEXT,
	pfp TEXT
);

CREATE TABLE IF NOT EXISTS posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	author TEXT NOT NULL,
	content TEXT NOT NULL,
	post_time INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (author) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS comments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	parent_post_id INTEGER NOT NULL,
	author TEXT NOT NULL,
	content TEXT NOT NULL,
	post_time INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (parent_post_id) REFERENCES posts(id),
	FOREIGN KEY (author) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS post_likes (
	post_id INTEGER NOT NULL,
	user TEXT NOT NULL,
	PRIMARY KEY (post_id, user),
	FOREIGN KEY (post_id) REFERENCES posts(id),
	FOREIGN KEY (user) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS comment_likes (
	comment_id INTEGER NOT NULL,
	username TEXT NOT NULL,
	PRIMARY KEY (comment_id, username),
	FOREIGN KEY (comment_id) REFERENCES comments(id),
	FOREIGN KEY (username) REFERENCES users(username)
);
