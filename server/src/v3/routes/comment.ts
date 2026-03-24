import { Context, Hono } from 'hono';
import { firebaseAuthMiddleware, firebaseAuthMiddlewareCheckOnly, penaltyCheckMiddleware, blockPenalizedUserMiddleware } from '../middleware';
import { comment, deleteComment, getCommentsOnPost, likeComment } from '../controllers/comment.controller';
import { validator } from 'hono/validator';
import { commentCreationSchema } from '../util/validationSchemas';
import { validationError } from '../util/requestValidation';


const app = new Hono<{ Bindings: Env }>();

app.post('/',
    validator('form', (value, c: Context) => {
        const parsed = commentCreationSchema.safeParse(value);
        if (!parsed.success) return validationError(c, parsed.error);
        return parsed.data;
    }),
    firebaseAuthMiddleware,
    penaltyCheckMiddleware,
    blockPenalizedUserMiddleware,
    (c: Context) => comment(c)
);
app.post('/like/:commentId', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => likeComment(c));
app.get('/:postId', firebaseAuthMiddlewareCheckOnly, (c: Context) => getCommentsOnPost(c));
app.delete('/:commentId', firebaseAuthMiddleware, penaltyCheckMiddleware, blockPenalizedUserMiddleware, (c: Context) => deleteComment(c));

export default app;
