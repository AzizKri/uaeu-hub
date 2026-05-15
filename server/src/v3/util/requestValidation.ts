import { Context } from 'hono';
import { z } from 'zod';

export function validationError(c: Context, error: z.ZodError) {
    const errors = error.issues.map((issue) => ({
        field: issue.path[0] ?? 'request',
        message: issue.message
    }));

    return c.json({ errors }, 400);
}

export function validateWithSchema<TSchema extends z.ZodTypeAny>(schema: TSchema, value: unknown) {
    return schema.safeParse(value);
}
