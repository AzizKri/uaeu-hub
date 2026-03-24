import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import {
    attachmentSourceSchema,
    feedbackListQuerySchema
} from '../../src/v3/util/validationSchemas';

const base = 'http://127.0.0.1:8787';
const validAssetId = '123e4567-e89b-12d3-a456-426614174000';

interface ValidationErrorBody {
    errors?: Array<{
        field?: string;
        message: string;
    }>;
}

async function expectValidationField(response: Response, field: string) {
    expect(response.status).toBe(400);
    const body = await response.json() as ValidationErrorBody;
    expect(body.errors?.some((error) => error.field === field)).toBe(true);
}

describe('Input hardening', () => {
    it('rejects empty post content before auth', async () => {
        const formData = new FormData();
        formData.append('content', '   ');

        const response = await SELF.fetch(`${base}/post`, {
            method: 'POST',
            body: formData
        });

        await expectValidationField(response, 'content');
    });

    it('rejects invalid comment and reply creation payloads before auth', async () => {
        const commentForm = new FormData();
        commentForm.append('postId', '0');
        commentForm.append('content', 'reply');

        const commentResponse = await SELF.fetch(`${base}/comment`, {
            method: 'POST',
            body: commentForm
        });

        await expectValidationField(commentResponse, 'postId');

        const subcommentForm = new FormData();
        subcommentForm.append('commentId', '1');
        subcommentForm.append('content', '   ');

        const subcommentResponse = await SELF.fetch(`${base}/subcomment`, {
            method: 'POST',
            body: subcommentForm
        });

        await expectValidationField(subcommentResponse, 'content');
    });

    it('rejects invalid Firebase auth utility payloads', async () => {
        const invalidAdminCheck = await SELF.fetch(`${base}/auth/check-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'not-an-email' })
        });

        await expectValidationField(invalidAdminCheck, 'email');

        const invalidRegister = await SELF.fetch(`${base}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: '??' })
        });

        await expectValidationField(invalidRegister, 'username');
    });

    it('rejects arbitrary avatar and community icon URLs', async () => {
        const invalidUserEdit = await SELF.fetch(`${base}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pfp: 'https://evil.example/avatar.png' })
        });

        await expectValidationField(invalidUserEdit, 'pfp');

        const communityForm = new FormData();
        communityForm.append('icon', 'data:image/png;base64,AAAA');

        const invalidCommunityEdit = await SELF.fetch(`${base}/community/1`, {
            method: 'POST',
            body: communityForm
        });

        await expectValidationField(invalidCommunityEdit, 'icon');
    });

    it('allows validated asset identifiers through validation and then reaches auth checks', async () => {
        const validUserEdit = await SELF.fetch(`${base}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pfp: validAssetId })
        });

        expect(validUserEdit.status).toBe(401);

        const communityForm = new FormData();
        communityForm.append('icon', validAssetId);

        const validCommunityEdit = await SELF.fetch(`${base}/community/1`, {
            method: 'POST',
            body: communityForm
        });

        expect(validCommunityEdit.status).toBe(401);
    });

    it('rejects invalid report action and report entity types', async () => {
        const invalidReportAction = await SELF.fetch(`${base}/report/1/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'drop_table', reason: 'bad' })
        });

        await expectValidationField(invalidReportAction, 'action');

        const invalidReport = await SELF.fetch(`${base}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entityId: 1,
                entityType: 'table',
                reportType: 'spam'
            })
        });

        await expectValidationField(invalidReport, 'entityType');
    });

    it('rejects invalid notification/report query parameters', async () => {
        const invalidOffset = await SELF.fetch(`${base}/post/latest?offset=-5`);
        await expectValidationField(invalidOffset, 'request');

        const invalidReportQuery = await SELF.fetch(
            `${base}/report/admin/all?includeResolved=true&entityType=table&offset=0`
        );
        await expectValidationField(invalidReportQuery, 'entityType');
    });

    it('rejects invalid upload sources', async () => {
        const attachmentForm = new FormData();
        attachmentForm.append('source', 'external');

        const invalidAttachmentUpload = await SELF.fetch(`${base}/attachment`, {
            method: 'POST',
            body: attachmentForm
        });

        await expectValidationField(invalidAttachmentUpload, 'request');

        const iconForm = new FormData();
        iconForm.append('source', 'external');

        const invalidIconUpload = await SELF.fetch(`${base}/attachment/icon`, {
            method: 'POST',
            body: iconForm
        });

        await expectValidationField(invalidIconUpload, 'request');
    });
});

describe('Validation schemas', () => {
    it('rejects unsupported feedback statuses', () => {
        expect(
            feedbackListQuerySchema.safeParse({
                status: 'archived',
                offset: '0'
            }).success
        ).toBe(false);
    });

    it('rejects unsupported attachment sources', () => {
        expect(attachmentSourceSchema.safeParse('javascript:alert(1)').success).toBe(false);
    });
});
