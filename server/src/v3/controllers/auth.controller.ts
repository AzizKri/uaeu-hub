import { Context } from 'hono';
import { addUserToGeneralCommunity, clearAuthCookies, createAnonymousSession, createSession, deleteCurrentSession } from '../util/session';
import { generateSalt, hashPassword, verifyPassword } from '../util/crypto';
import { createToken } from '../util/token';
import { createPublicId } from '../util/nanoid';
import { isUsernameValid } from '../util/validationSchemas';
import { resetPasswordEmail, sendEmail, verificationEmail } from '../services/email';

const PASSWORD_RESET_TTL_SECONDS = 60 * 15;
const EMAIL_VERIFICATION_TTL_SECONDS = 60 * 60 * 24;

type AuthUserRow = {
    id: string;
    public_id?: string;
    username: string;
    displayname: string | null;
    email: string | null;
    email_verified: number | boolean;
    bio: string | null;
    pfp: string | null;
    is_anonymous: number | boolean;
    is_admin: number | boolean;
    suspended_until: number | null;
    is_banned: number | boolean;
}

type UserWithPasswordRow = AuthUserRow & {
    password: string | null;
    salt: string | null;
    is_deleted: number | boolean;
}

type SignupBody = {
    username: string;
    displayname?: string;
    email: string;
    password: string;
    includeAnon?: boolean;
}

type LoginBody = {
    identifier: string;
    password: string;
}

function nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
}

function dbBool(value: boolean | number | null | undefined): boolean {
    return value === true || value === 1;
}

function tokenCreatedAt(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) return numeric;

        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
    }
    return 0;
}

function publicUser(row: AuthUserRow) {
    return {
        id: row.id,
        public_id: row.public_id,
        username: row.username,
        displayname: row.displayname,
        email: row.email,
        email_verified: dbBool(row.email_verified),
        bio: row.bio,
        pfp: row.pfp,
        is_anonymous: dbBool(row.is_anonymous),
        is_admin: dbBool(row.is_admin),
        suspended_until: row.suspended_until,
        is_banned: dbBool(row.is_banned)
    };
}

function passwordPepper(c: Context): string {
    if (!c.env.PASSWORD_PEPPER) throw new Error('PASSWORD_PEPPER is not configured');
    return c.env.PASSWORD_PEPPER;
}

async function selectAuthUser(c: Context, userId: string): Promise<AuthUserRow | null> {
    return c.env.DB.prepare(`
        SELECT
            id,
            public_id,
            username,
            displayname,
            email,
            email_verified,
            bio,
            pfp,
            is_anonymous,
            is_admin,
            suspended_until,
            is_banned
        FROM user
        WHERE id = ? AND is_deleted = 0
    `).bind(userId).first<AuthUserRow>();
}

async function selectUserWithPassword(c: Context, identifier: string): Promise<UserWithPasswordRow | null> {
    return c.env.DB.prepare(`
        SELECT
            id,
            public_id,
            username,
            displayname,
            email,
            email_verified,
            bio,
            pfp,
            is_anonymous,
            is_admin,
            suspended_until,
            is_banned,
            is_deleted,
            password,
            salt
        FROM user
        WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
            AND is_deleted = 0
        LIMIT 1
    `).bind(identifier, identifier).first<UserWithPasswordRow>();
}

async function emailExists(c: Context, email: string, exceptUserId?: string): Promise<boolean> {
    const row = await c.env.DB.prepare(`
        SELECT id FROM user
        WHERE LOWER(email) = LOWER(?)
            AND (? IS NULL OR id != ?)
        LIMIT 1
    `).bind(email, exceptUserId ?? null, exceptUserId ?? null).first<{ id: string }>();
    return !!row;
}

async function usernameExists(c: Context, username: string, exceptUserId?: string): Promise<boolean> {
    const row = await c.env.DB.prepare(`
        SELECT id FROM user
        WHERE LOWER(username) = LOWER(?)
            AND (? IS NULL OR id != ?)
        LIMIT 1
    `).bind(username, exceptUserId ?? null, exceptUserId ?? null).first<{ id: string }>();
    return !!row;
}

function queueEmail(c: Context, promise: Promise<unknown>): void {
    c.executionCtx.waitUntil(promise.catch((error) => {
        console.error('email send failed', error);
    }));
}

async function createVerificationToken(c: Context, user: AuthUserRow): Promise<string> {
    if (!user.email) throw new Error('Cannot verify a user without email');

    const token = createToken();
    await c.env.DB.prepare(`
        INSERT INTO email_verification (token, user_id, email)
        VALUES (?, ?, ?)
    `).bind(token, user.id, user.email).run();

    const email = verificationEmail(c, token, user.username);
    queueEmail(c, sendEmail(c, { to: user.email, ...email }));

    return token;
}

async function createResetToken(c: Context, user: AuthUserRow): Promise<string> {
    if (!user.email) throw new Error('Cannot reset password for a user without email');

    const token = createToken();
    await c.env.DB.prepare(`
        INSERT INTO password_reset (token, user_id)
        VALUES (?, ?)
    `).bind(token, user.id).run();

    const email = resetPasswordEmail(c, token, user.username);
    queueEmail(c, sendEmail(c, { to: user.email, ...email }));

    return token;
}

async function completeSignup(c: Context, userId: string): Promise<AuthUserRow> {
    await addUserToGeneralCommunity(c, userId);

    const user = await selectAuthUser(c, userId);
    if (!user) throw new Error('Failed to load created user');

    await createSession(c, userId, false);
    await createVerificationToken(c, user);

    return user;
}

export async function checkUsername(c: Context) {
    const username = c.req.query('username')?.trim().toLowerCase();
    if (!username) return c.json({ available: false, message: 'Username is required' }, 400);
    if (
        username.length < 3 ||
        username.length > 20 ||
        !/^(?!.*[_.-]{2})[a-z0-9._-]+$/.test(username)
    ) {
        return c.json({ available: false, message: 'Username is invalid' }, 400);
    }
    if (!isUsernameValid(username)) return c.json({ available: false, message: 'Username is not allowed' }, 200);

    const taken = await usernameExists(c, username);
    return c.json({
        available: !taken,
        message: taken ? 'Username is already taken' : 'Username is available'
    }, 200);
}

export async function signup(c: Context) {
    const body = c.req.valid('json') as SignupBody;
    const username = body.username.trim().toLowerCase();
    const displayname = body.displayname?.trim() || username;
    const email = body.email.trim().toLowerCase();
    const includeAnon = body.includeAnon === true;
    const existingUserId = c.get('userId') as string | undefined;
    const isAnonymous = c.get('isAnonymous') as boolean | undefined;

    if (!isUsernameValid(username)) return c.json({ message: 'Username is not allowed' }, 400);

    const targetUserId = includeAnon && existingUserId && isAnonymous ? existingUserId : undefined;

    if (await usernameExists(c, username, targetUserId)) {
        return c.json({ message: 'Username is already taken' }, 409);
    }

    if (await emailExists(c, email, targetUserId)) {
        return c.json({ message: 'Email is already in use' }, 409);
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(body.password, salt.salt, passwordPepper(c));

    if (includeAnon) {
        if (!targetUserId) return c.json({ message: 'No anonymous session to upgrade' }, 400);

        await c.env.DB.prepare(`
            UPDATE user
            SET username = ?,
                displayname = ?,
                email = ?,
                password = ?,
                salt = ?,
                email_verified = 0,
                is_anonymous = 0
            WHERE id = ?
        `).bind(username, displayname, email, passwordHash, salt.encoded, targetUserId).run();

        await c.env.DB.prepare(`
            UPDATE session
            SET is_anonymous = 0
            WHERE user_id = ?
        `).bind(targetUserId).run();

        await addUserToGeneralCommunity(c, targetUserId);
        await createSession(c, targetUserId, false);

        const user = await selectAuthUser(c, targetUserId);
        if (!user) return c.json({ message: 'Failed to upgrade anonymous user' }, 500);

        await createVerificationToken(c, user);
        return c.json({ user: publicUser(user) }, 200);
    }

    await deleteCurrentSession(c, false);

    const inserted = await c.env.DB.prepare(`
        INSERT INTO user (
            id,
            public_id,
            username,
            displayname,
            email,
            password,
            salt,
            email_verified,
            is_anonymous
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
        RETURNING id
    `).bind(crypto.randomUUID(), createPublicId(), username, displayname, email, passwordHash, salt.encoded).first<{ id: string }>();

    if (!inserted) return c.json({ message: 'Failed to create user' }, 500);

    const user = await completeSignup(c, inserted.id);
    return c.json({ user: publicUser(user) }, 201);
}

export async function login(c: Context) {
    const body = c.req.valid('json') as LoginBody;
    const user = await selectUserWithPassword(c, body.identifier.trim());

    if (!user || dbBool(user.is_anonymous) || !user.password || !user.salt) {
        return c.json({ message: 'Invalid username/email or password' }, 401);
    }

    if (dbBool(user.is_banned)) {
        return c.json({ message: 'Account is banned', banned: true }, 403);
    }

    const passwordMatches = await verifyPassword(body.password, user.salt, user.password, passwordPepper(c));
    if (!passwordMatches) {
        return c.json({ message: 'Invalid username/email or password' }, 401);
    }

    await deleteCurrentSession(c, false);
    await createSession(c, user.id, false);

    return c.json({ user: publicUser(user) }, 200);
}

export async function logout(c: Context) {
    await deleteCurrentSession(c);
    return c.json({ message: 'Logged out' }, 200);
}

export async function authenticateUser(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) return c.json({ user: null }, 200);

    const user = await selectAuthUser(c, userId);
    return c.json({ user: user ? publicUser(user) : null }, 200);
}

export async function isUser(c: Context) {
    const userId = c.get('userId') as string | undefined;
    const isAnonymous = c.get('isAnonymous') as boolean | undefined;
    return c.json({ user: !!userId && !isAnonymous }, 200);
}

export async function isAnon(c: Context) {
    const userId = c.get('userId') as string | undefined;
    const isAnonymous = c.get('isAnonymous') as boolean | undefined;
    return c.json({ anon: !!userId && !!isAnonymous }, 200);
}

export async function sendEmailVerification(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) return c.json({ message: 'Not authenticated' }, 401);

    const user = await selectAuthUser(c, userId);
    if (!user || dbBool(user.is_anonymous)) return c.json({ message: 'Not authenticated' }, 401);
    if (!user.email) return c.json({ message: 'User has no email address' }, 400);
    if (dbBool(user.email_verified)) return c.json({ message: 'Email is already verified' }, 400);

    await createVerificationToken(c, user);
    return c.json({ message: 'Verification email sent' }, 200);
}

export async function verifyEmail(c: Context) {
    const token = c.req.query('token');
    if (!token) return c.json({ message: 'Verification token is required' }, 400);

    const row = await c.env.DB.prepare(`
        SELECT token, user_id, email, used, created_at
        FROM email_verification
        WHERE token = ?
    `).bind(token).first<EmailVerificationRow>();

    if (!row || dbBool(row.used)) return c.json({ message: 'Invalid verification token' }, 400);
    if (tokenCreatedAt(row.created_at) + EMAIL_VERIFICATION_TTL_SECONDS < nowSeconds()) {
        return c.json({ message: 'Verification token expired' }, 400);
    }

    await c.env.DB.batch([
        c.env.DB.prepare(`
            UPDATE user
            SET email_verified = 1
            WHERE id = ? AND email = ?
        `).bind(row.user_id, row.email),
        c.env.DB.prepare(`
            UPDATE email_verification
            SET used = 1
            WHERE token = ?
        `).bind(token)
    ]);

    return c.json({ message: 'Email verified' }, 200);
}

export async function sendForgotPasswordEmail(c: Context) {
    const { email } = c.req.valid('json') as { email: string };
    const user = await c.env.DB.prepare(`
        SELECT
            id,
            public_id,
            username,
            displayname,
            email,
            email_verified,
            bio,
            pfp,
            is_anonymous,
            is_admin,
            suspended_until,
            is_banned
        FROM user
        WHERE LOWER(email) = LOWER(?)
            AND is_deleted = 0
            AND is_anonymous = 0
        LIMIT 1
    `).bind(email.trim().toLowerCase()).first<AuthUserRow>();

    if (!user) return c.json({ message: 'No account found for that email' }, 404);

    await createResetToken(c, user);
    return c.json({ message: 'Password reset email sent' }, 200);
}

export async function resetPassword(c: Context) {
    const token = c.req.query('token');
    const { newPassword } = c.req.valid('json') as { newPassword: string };
    if (!token) return c.json({ message: 'Password reset token is required' }, 400);

    const row = await c.env.DB.prepare(`
        SELECT token, user_id, used, created_at
        FROM password_reset
        WHERE token = ?
    `).bind(token).first<PasswordResetRow>();

    if (!row || dbBool(row.used)) return c.json({ message: 'Invalid password reset token' }, 400);
    if (tokenCreatedAt(row.created_at) + PASSWORD_RESET_TTL_SECONDS < nowSeconds()) {
        return c.json({ message: 'Password reset token expired' }, 400);
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt.salt, passwordPepper(c));

    await c.env.DB.batch([
        c.env.DB.prepare(`
            UPDATE user
            SET password = ?, salt = ?
            WHERE id = ?
        `).bind(passwordHash, salt.encoded, row.user_id),
        c.env.DB.prepare(`
            UPDATE password_reset
            SET used = 1
            WHERE token = ?
        `).bind(token),
        c.env.DB.prepare(`
            DELETE FROM session
            WHERE user_id = ?
        `).bind(row.user_id)
    ]);

    await clearDanglingAuth(c);
    return c.json({ message: 'Password reset successful' }, 200);
}

export async function changePassword(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) return c.json({ message: 'Not authenticated' }, 401);

    const { currentPassword, newPassword } = c.req.valid('json') as { currentPassword: string; newPassword: string };
    const user = await c.env.DB.prepare(`
        SELECT
            id,
            public_id,
            username,
            displayname,
            email,
            email_verified,
            bio,
            pfp,
            is_anonymous,
            is_admin,
            suspended_until,
            is_banned,
            is_deleted,
            password,
            salt
        FROM user
        WHERE id = ? AND is_deleted = 0 AND is_anonymous = 0
    `).bind(userId).first<UserWithPasswordRow>();

    if (!user || !user.password || !user.salt) return c.json({ message: 'Not authenticated' }, 401);
    if (!await verifyPassword(currentPassword, user.salt, user.password, passwordPepper(c))) {
        return c.json({ message: 'Current password is incorrect' }, 401);
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt.salt, passwordPepper(c));

    await c.env.DB.batch([
        c.env.DB.prepare(`
            UPDATE user
            SET password = ?, salt = ?
            WHERE id = ?
        `).bind(passwordHash, salt.encoded, userId),
        c.env.DB.prepare(`
            DELETE FROM session
            WHERE user_id = ?
        `).bind(userId)
    ]);

    await createSession(c, userId, false);
    return c.json({ message: 'Password changed' }, 200);
}

export async function changeEmail(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) return c.json({ message: 'Not authenticated' }, 401);

    const { email, password } = c.req.valid('json') as { email: string; password: string };
    const normalizedEmail = email.trim().toLowerCase();

    if (await emailExists(c, normalizedEmail, userId)) {
        return c.json({ message: 'Email is already in use' }, 409);
    }

    const user = await c.env.DB.prepare(`
        SELECT
            id,
            public_id,
            username,
            displayname,
            email,
            email_verified,
            bio,
            pfp,
            is_anonymous,
            is_admin,
            suspended_until,
            is_banned,
            is_deleted,
            password,
            salt
        FROM user
        WHERE id = ? AND is_deleted = 0 AND is_anonymous = 0
    `).bind(userId).first<UserWithPasswordRow>();

    if (!user || !user.password || !user.salt) return c.json({ message: 'Not authenticated' }, 401);
    if (!await verifyPassword(password, user.salt, user.password, passwordPepper(c))) {
        return c.json({ message: 'Password is incorrect' }, 401);
    }

    await c.env.DB.prepare(`
        UPDATE user
        SET email = ?, email_verified = 0
        WHERE id = ?
    `).bind(normalizedEmail, userId).run();

    const updatedUser = await selectAuthUser(c, userId);
    if (!updatedUser) return c.json({ message: 'Failed to update email' }, 500);

    await createVerificationToken(c, updatedUser);
    return c.json({ user: publicUser(updatedUser) }, 200);
}

export async function anonSignup(c: Context, withId = false) {
    const session = await createAnonymousSession(c);
    return withId ? session.userId : c.json({ userId: session.userId }, 200);
}

async function clearDanglingAuth(c: Context): Promise<void> {
    await clearAuthCookies(c);
}
