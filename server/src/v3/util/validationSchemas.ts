import { z } from 'zod';

export const communitySchema = z.object({
    name: z.string().min(3, 'Community name must be at least 3 characters long').max(32, 'Community name must be at most 32 characters long'),
    desc: z.string().max(1024, 'Community description must be at most 1024 characters long'),
    icon: z.string().optional(),
    tags: z.array(z.string()).max(5, 'Community tags must be at most 5 tags long'),

    // Currently unimplemented

    // public: z.boolean(),
    // inviteOnly: z.boolean(),
});

const displaynameSchema = z
    .union([z.string().min(3, 'Display name must be at least 3 characters long'), z.string().length(0)])
    .optional()
    .transform((value) => value === '' ? undefined : value);

const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20)
    .regex(/^[a-zA-Z0-9.\-_]+$/,
        'Username can only contain alphanumeric characters, underscores, dashes, and dots, but not consecutively');

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
