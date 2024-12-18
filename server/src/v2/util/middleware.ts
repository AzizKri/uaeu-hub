import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';


export const authMiddleware = createMiddleware(
    async (c, next) => {
        jwt({
            secret: c.env.JWT_SECRET, cookie: 'jwt'
        });

        const user = c.get('jwtPayload');
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        await next();
    }
);
