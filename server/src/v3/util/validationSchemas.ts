import { z } from 'zod';
import usernames from './usernames.json';

export const communitySchema = z.object({
    name: z.string()
        .min(3, 'Community name must be at least 3 characters long')
        .max(32, 'Community name must be at most 32 characters long'),
    desc: z.string()
        .max(1024, 'Community description must be at most 1024 characters long'),
    icon: z.string()
        .optional(),
    tags: z.string()
        .transform((tags) => tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0))
        .refine((tags) => tags.length > 0, { message: 'Tags cannot be empty' })

    // Currently unimplemented

    // public: z.boolean(),
    // inviteOnly: z.boolean(),
});

export const communityEditingSchema = z.object({
    name: z.string().min(3, 'Community name must be at least 3 characters long').max(32, 'Community name must be at most 32 characters long').nullable().optional(),
    desc: z.string().max(1024, 'Community description must be at most 1024 characters long').optional().nullable(),
    icon: z.string().optional(),
    tags: z
        .string()
        .transform((value) => value.split(',').map((tag) => tag.trim()))
        .refine((array) => array.length <= 5, {
            message: 'Community tags must be at most 5 tags long',
        })
        .optional()
        .nullable(),

    // Currently unimplemented

    // public: z.boolean(),
    // inviteOnly: z.boolean(),
});

const displaynameSchema = z
    .union([z.string().min(4, 'Display name must be at least 3 characters long'), z.string().length(0)])
    .optional()
    .transform((value) => value === '' ? undefined : value);

const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20)
    .regex(/^[a-z0-9.\-_]+$/,
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

export const userEditingSchema = z.object({
    displayname: displaynameSchema.optional(),
    bio: z.string().max(1024, 'Bio must be at most 1024 characters long').optional(),
    pfp: z.string().optional()
})

export function isUsernameValid(username: string): boolean {
    return !usernames.includes(username);
}
