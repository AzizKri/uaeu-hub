import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly, postRateLimitMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware } from '../middleware';
import {
    deleteSubcomment,
    getSubcommentsOnComment,
    likeSubcomment,
    subcomment
} from '../controllers/subcomment.controller';
import { validator } from 'hono/validator';
import { subcommentCreationSchema } from '../util/validationSchemas';
import { validationError } from '../util/requestValidation';


const app = new Hono<{ Bindings: Env }>();

app.post('/',
    postRateLimitMiddleware,
    validator('form', (value, c: Context) => {
        const parsed = subcommentCreationSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    firebaseAuthMiddleware,
    penaltyCheckMiddleware,
    blockPenalizedUserMiddleware,
    (c: Context) => subcomment(c)
);
app.post('/like/:scid', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => likeSubcomment(c));
app.get('/:cid', firebaseAuthMiddlewareCheckOnly, (c: Context) => getSubcommentsOnComment(c));
app.delete('/:scid', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => deleteSubcomment(c));

export default app;
