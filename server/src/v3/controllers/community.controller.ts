import { Context } from 'hono';
// import { getSignedCookie } from 'hono/cookie';
// import { getUserFromSessionKey } from '../util/util';

export async function getCommunity(c: Context) {
    // const env: Env = c.env;
    // const { cid } = c.req.param();
    // const sessionKey = await getSignedCookie(c, env.JWT_SECRET, 'sessionKey') as string;
    //
    // try {
    //     const userid = await getUserFromSessionKey(c, sessionKey);
    //
    //     if (!userid) {
    //         const community = await env.DB.prepare(`
    //             SELECT *`)
    //     }
    // }
    return c.text('Unimplemented', { status: 501 });
}
