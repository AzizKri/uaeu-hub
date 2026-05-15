import { z } from 'zod';
import usernames from './usernames.json';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const nonEmptyText = (fieldName: string) => z.string().refine((value) => value.trim().length > 0, {
    message: `${fieldName} cannot be empty`
});
const optionalAssetIdSchema = z.string().regex(uuidRegex, 'Invalid asset identifier').optional();
const communityTagsSchema = z
    .string()
    .optional()
    .default('')
    .transform((tags) => {
        const parsedTags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
        return parsedTags.length > 0 ? parsedTags : ['Other'];
    });
const booleanQuerySchema = z.preprocess(
    (value) => value === undefined ? 'false' : value,
    z.enum(['true', 'false']).transform((value) => value === 'true')
);

export const assetIdSchema = z.string().regex(uuidRegex, 'Invalid asset identifier');
export const uuidSchema = z.string().regex(uuidRegex, 'Invalid identifier');
export const numericIdSchema = z.coerce.number().int().positive('Invalid identifier');
export const reportEntityIdSchema = z.union([
    numericIdSchema.transform((value) => value.toString()),
    uuidSchema
]);
export const offsetSchema = z.coerce.number().int().min(0, 'Offset must be a non-negative integer').default(0);
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');
export const entityTypeSchema = z.enum(['user', 'post', 'comment', 'subcomment', 'community']);
export const attachmentSourceSchema = z.enum(['attachments', 'icon', 'pfp']);

// Community

export const communitySchema = z.object({
    name: z.string()
        .min(3, 'Community name must be at least 3 characters long')
        .max(32, 'Community name must be at most 32 characters long'),
    desc: z.string()
        .max(1024, 'Community description must be at most 1024 characters long'),
    icon: assetIdSchema
        .optional(),
    tags: communityTagsSchema

    // Currently unimplemented

    // public: z.boolean(),
    // inviteOnly: z.boolean(),
});

export const communityEditingSchema = z.object({
    name: z.string().min(3, 'Community name must be at least 3 characters long').max(32, 'Community name must be at most 32 characters long').nullable().optional(),
    desc: z.string().max(1024, 'Community description must be at most 1024 characters long').optional().nullable(),
    icon: assetIdSchema.optional(),
    tags: z
        .string()
        .transform((value) => value.split(',').map((tag) => tag.trim()))
        .refine((array) => array.length <= 5, {
            message: 'Community tags must be at most 5 tags long'
        })
        .optional()
        .nullable()

    // Currently unimplemented

    // public: z.boolean(),
    // inviteOnly: z.boolean(),
});

export const communityInviteSchema = z.object({
    userId: uuidSchema,
    communityId: z.coerce.number()
});

// User

const displaynameSchema = z
    .union([z.string().min(4, 'Display name must be at least 3 characters long'), z.string().length(0)])
    .optional()
    .transform((value) => value === '' ? undefined : value);

const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20)
    .regex(/^(?!.*[_.-]{2})[a-z0-9._-]+$/,
        'Username can only contain lower letters, underscores, dashes, and dots, but not consecutively');

const emailSchema = z
    .string()
    .email('Invalid email address');

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must be at most 72 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[ !"#$%&'()*+,-./:;<=>?@\[\\\]^_`{|}]/, 'Password must contain at least one special character');

export const userSchema = z.object({
    displayname: displaynameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema
});

export const signupSchema = userSchema.extend({
    includeAnon: z.boolean().optional()
});

export const loginSchema = z.object({
    identifier: z.string().min(1, 'Username or email is required'),
    password: z.string().min(1, 'Password is required')
});

export const userEditingSchema = z.object({
    displayname: displaynameSchema.optional(),
    bio: z.string().max(1024, 'Bio must be at most 1024 characters long').optional(),
    pfp: assetIdSchema.optional()
});

export const forgotPasswordSchema = z.object({
    email: emailSchema
})

export const passwordResetSchema = z.object({
    newPassword: passwordSchema,
});

export const passwordChangeSchema = z.object({
    currentPassword: z.string(),
    newPassword: passwordSchema
})

export const emailChangeSchema = z.object({
    email: emailSchema,
    password: z.string()
})

export function isUsernameValid(username: string): boolean {
    return !usernames.includes(username);
}

// Report

export const reportSchema = z.object({
    entityId: reportEntityIdSchema,
    entityType: entityTypeSchema,
    reportType: nonEmptyText('Report type'),
    reason: z.string().max(1024, 'Reason must be at most 1024 characters long').optional()
});

export const resolveReportSchema = z.object({
    reportId: numericIdSchema,
    communityId: numericIdSchema
});

// Feedback (Bug Reports & Feature Requests)

export const feedbackSchema = z.object({
    description: z.string()
        .min(10, 'Description must be at least 10 characters long')
        .max(2048, 'Description must be at most 2048 characters long'),
    screenshot: z.string().optional()
});

export const feedbackStatusSchema = z.object({
    status: z.enum(['pending', 'reviewed', 'resolved', 'closed'])
});

// Content creation

export const postCreationSchema = z.object({
    content: nonEmptyText('Content'),
    communityId: z.coerce.number().int().min(0, 'Invalid community ID').default(0),
    filename: optionalAssetIdSchema
});

export const commentCreationSchema = z.object({
    postId: numericIdSchema,
    content: nonEmptyText('Content'),
    filename: optionalAssetIdSchema
});

export const subcommentCreationSchema = z.object({
    commentId: numericIdSchema,
    content: nonEmptyText('Content'),
    filename: optionalAssetIdSchema
});

// Admin

export const adminTargetParamSchema = z.object({
    userId: uuidSchema
});

export const adminSuspendSchema = z.object({
    days: z.coerce.number().int().positive('Days must be a positive integer').optional(),
    reason: nonEmptyText('Reason')
});

export const adminBanSchema = z.object({
    reason: nonEmptyText('Reason')
});

// Reports

export const reportActionParamSchema = z.object({
    reportId: numericIdSchema
});

export const reportActionSchema = z.object({
    action: z.enum(['delete', 'delete_suspend', 'delete_ban', 'warn', 'dismiss']),
    reason: z.string().optional()
}).superRefine((value, ctx) => {
    if (value.action !== 'dismiss' && (!value.reason || value.reason.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reason'],
            message: 'Reason is required'
        });
    }
});

export const reportListQuerySchema = z.object({
    includeResolved: booleanQuerySchema,
    offset: offsetSchema
});

export const reportsWithDetailsQuerySchema = z.object({
    includeResolved: booleanQuerySchema,
    entityType: entityTypeSchema.optional(),
    offset: offsetSchema
});

// Feedback

export const feedbackListQuerySchema = z.object({
    status: feedbackStatusSchema.shape.status.optional(),
    offset: offsetSchema
});

export const feedbackStatusParamSchema = z.object({
    type: z.enum(['bug', 'feature']),
    id: numericIdSchema
});

// Query helpers

export const notificationsQuerySchema = z.object({
    offset: offsetSchema
});

export const searchQuerySchema = z.object({
    query: nonEmptyText('Query'),
    offset: offsetSchema
});

export const communitySearchQuerySchema = searchQuerySchema;

export const communitySortQuerySchema = z.object({
    order: sortOrderSchema,
    offset: offsetSchema
});

export const userSearchWithCommunityQuerySchema = z.object({
    query: nonEmptyText('Query'),
    communityId: numericIdSchema,
    offset: offsetSchema
});
