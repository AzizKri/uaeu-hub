import { D1Database } from '@cloudflare/workers-types';

declare module "cloudflare:test" {
    // Controls the type of `import("cloudflare:test").env`
    interface ProvidedEnv extends Env {
        DB: D1Database;
        TEST_MIGRATIONS: string[];
        SIGNUP_RL: RateLimiterBinding;
        LOGIN_RL: RateLimiterBinding;
        GET_POSTS_RL: RateLimiterBinding;
        GET_COMMENTS_RL: RateLimiterBinding;
        GET_REPLIES_RL: RateLimiterBinding;
        COMMENTS_RL: RateLimiterBinding;
        REPLIES_RL: RateLimiterBinding;
        GET_COMMUNITIES_RL: RateLimiterBinding;
        GET_TAGS_RL: RateLimiterBinding;
        COMMUNITIES_RL: RateLimiterBinding;
        TAGS_RL: RateLimiterBinding;
    }
}

interface RateLimiterBinding {
    limit: (key: string) => Promise<boolean>;
}
