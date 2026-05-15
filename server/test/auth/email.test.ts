import { vi } from 'vitest';
import { sendEmail } from '../../src/v3/services/email';

describe('email service', () => {
    it('uses EMAIL_API as a Resend API key alias when RESEND_API_KEY is absent', async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 'email_123' }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        }));
        const originalFetch = globalThis.fetch;
        globalThis.fetch = fetchMock as typeof fetch;

        try {
            const context = {
                env: {
                    EMAIL_API: 'legacy_resend_key',
                    AUTH_EMAIL_FROM: 'UAEU Chat <no-reply@uaeu.chat>'
                }
            };

            await sendEmail(context as never, {
                to: 'student@example.com',
                subject: 'Verify your UAEU Chat email',
                html: '<p>Verify</p>',
                text: 'Verify'
            });

            expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer legacy_resend_key'
                })
            }));
            const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
            expect(JSON.parse(request.body as string)).toMatchObject({
                from: 'UAEU Chat <no-reply@uaeu.chat>',
                to: ['student@example.com'],
                subject: 'Verify your UAEU Chat email',
                html: '<p>Verify</p>',
                text: 'Verify'
            });
        } finally {
            globalThis.fetch = originalFetch;
        }
    });
});
