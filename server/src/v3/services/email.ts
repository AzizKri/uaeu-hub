import { Context } from 'hono';

type EmailPayload = {
    to: string;
    subject: string;
    html: string;
    text: string;
}

type EmailResult = {
    id: string;
}

function appUrl(c: Context): string {
    return (c.env.PUBLIC_APP_URL || 'http://localhost:5173').replace(/\/$/, '');
}

export async function sendEmail(c: Context, payload: EmailPayload): Promise<EmailResult> {
    if (c.env.EMAIL_SEND_DISABLED === 'true') {
        return { id: `test_${Date.now()}` };
    }

    const resendApiKey = c.env.RESEND_API_KEY || (c.env as { EMAIL_API?: string }).EMAIL_API;
    if (!resendApiKey) throw new Error('RESEND_API_KEY or EMAIL_API is not configured');

    return sendResendEmail(c, payload, resendApiKey);
}

async function sendResendEmail(c: Context, payload: EmailPayload, apiKey: string): Promise<EmailResult> {
    const authorization = `Bearer ${apiKey}`;
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: c.env.AUTH_EMAIL_FROM || 'UAEU Chat <no-reply@uaeu.chat>',
            to: [payload.to],
            subject: payload.subject,
            html: payload.html,
            text: payload.text
        })
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend email failed: ${response.status} ${body}`);
    }

    return response.json();
}

export function verificationEmail(c: Context, token: string, username: string): Pick<EmailPayload, 'subject' | 'html' | 'text'> {
    const link = `${appUrl(c)}/verify-email?token=${encodeURIComponent(token)}`;
    const subject = 'Verify your UAEU Chat email';
    const text = `Hi ${username}, verify your UAEU Chat email by opening this link: ${link}`;
    const html = `<p>Hi ${escapeHtml(username)},</p><p>Verify your UAEU Chat email by opening this link:</p><p><a href="${link}">${link}</a></p>`;

    return { subject, html, text };
}

export function resetPasswordEmail(c: Context, token: string, username: string): Pick<EmailPayload, 'subject' | 'html' | 'text'> {
    const link = `${appUrl(c)}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Reset your UAEU Chat password';
    const text = `Hi ${username}, reset your UAEU Chat password by opening this link: ${link}`;
    const html = `<p>Hi ${escapeHtml(username)},</p><p>Reset your UAEU Chat password by opening this link:</p><p><a href="${link}">${link}</a></p>`;

    return { subject, html, text };
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
