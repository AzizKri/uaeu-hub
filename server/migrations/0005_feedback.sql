-- Migration to add bug_report and feature_request tables for user feedback

-- Bug Report Table
CREATE TABLE IF NOT EXISTS bug_report
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id   TEXT UNIQUE,
    reporter_id INTEGER NOT NULL,
    description TEXT    NOT NULL,
    screenshot  TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending',
    created_at  INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (screenshot) REFERENCES attachment (filename) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_bug_report_public_id ON bug_report(public_id);
CREATE INDEX idx_bug_report_status ON bug_report(status, created_at DESC);

-- Feature Request Table
CREATE TABLE IF NOT EXISTS feature_request
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id   TEXT UNIQUE,
    reporter_id INTEGER NOT NULL,
    description TEXT    NOT NULL,
    screenshot  TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending',
    created_at  INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (screenshot) REFERENCES attachment (filename) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_feature_request_public_id ON feature_request(public_id);
CREATE INDEX idx_feature_request_status ON feature_request(status, created_at DESC);
