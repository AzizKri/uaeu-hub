ALTER TABLE community_role
    ADD COLUMN delete_posts BOOLEAN NOT NULL DEFAULT administrator;

ALTER TABLE community
    RENAME TO community_old;

CREATE TABLE IF NOT EXISTS community
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    description  TEXT,
    icon         TEXT,
    verified     BOOLEAN NOT NULL DEFAULT FALSE,
    public       BOOLEAN NOT NULL DEFAULT TRUE, /* Are messages publicly viewable? */
    invite_only  BOOLEAN NOT NULL DEFAULT FALSE, /* Can anyone join? */
    created_at   INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tags         TEXT,
    member_count INTEGER NOT NULL DEFAULT 0,
    owner_id     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE SET DEFAULT
);

INSERT INTO community (name, description, icon, verified, public, invite_only, created_at, tags, member_count, owner_id)
SELECT co.name,
       co.description,
       co.icon,
       co.verified,
       co.public,
       co.invite_only,
       co.created_at,
       co.tags,
       co.member_count,
       uc.user_id AS owner_id
FROM community_old co
         LEFT JOIN user_community uc
                   ON co.id = uc.community_id AND uc.role_id = (SELECT id
                                                                FROM community_role cr
                                                                WHERE cr.community_id = co.id
                                                                  AND cr.name = 'Administrator');

