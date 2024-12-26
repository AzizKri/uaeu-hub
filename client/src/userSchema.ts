import { z } from 'zod';

const displaynameSchema = z
    .string()
    .min(3, 'Display name must be at least 3 characters long')
    .max(32, 'Display name must be at most 32 characters long')
    .optional();

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