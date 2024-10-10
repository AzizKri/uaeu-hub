import {Hono} from "hono";
import {Bindings} from "../../util/types";

const post = new Hono<{ Bindings: Bindings }>();

post.get()

// user.get('/authenticate', (c) => Authenticate(c));
// user.get('/:username', (c) => getByUsername(c));

export default post;
