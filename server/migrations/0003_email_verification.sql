CREATE TABLE IF NOT EXISTS email_verification
(
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    email      TEXT    NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);
