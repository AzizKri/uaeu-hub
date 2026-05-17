import { Context } from 'hono';
import emailTemplate from '../util/email_template.html';

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

function renderTemplate(opts: {
    heading: string;
    intro: string;
    buttonText: string;
    actionUrl: string;
    footerNote: string;
}): string {
    return emailTemplate
        .replaceAll('{{heading}}', escapeHtml(opts.heading))
        .replaceAll('{{intro}}', escapeHtml(opts.intro))
        .replaceAll('{{buttonText}}', escapeHtml(opts.buttonText))
        .replaceAll('{{footerNote}}', escapeHtml(opts.footerNote))
        .replaceAll('{{actionUrl}}', escapeHtml(opts.actionUrl));
}

export function verificationEmail(c: Context, token: string, username: string): Pick<EmailPayload, 'subject' | 'html' | 'text'> {
    const link = `${appUrl(c)}/verify-email?token=${encodeURIComponent(token)}`;
    const subject = 'Verify your UAEU Chat email';
    const text = `Hi ${username}, verify your UAEU Chat email by opening this link: ${link}`;
    const html = renderTemplate({
        heading: `Welcome, ${username}!`,
        intro: "Glad to have you onboard! We're excited to start chatting with you. Please verify your email address to activate your account.",
        buttonText: 'Verify Email',
        actionUrl: link,
        footerNote: "If you didn't sign up for uaeu.chat, you can safely ignore this email."
    });

    return { subject, html, text };
}

export function resetPasswordEmail(c: Context, token: string, username: string): Pick<EmailPayload, 'subject' | 'html' | 'text'> {
    const link = `${appUrl(c)}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Reset your UAEU Chat password';
    const text = `Hi ${username}, reset your UAEU Chat password by opening this link: ${link}`;
    const html = renderTemplate({
        heading: `Hi ${username},`,
        intro: 'We received a request to reset your uaeu.chat password. Click the button below to choose a new one. This link will expire shortly for your security.',
        buttonText: 'Reset Password',
        actionUrl: link,
        footerNote: "If you didn't request a password reset, you can safely ignore this email."
    });

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
