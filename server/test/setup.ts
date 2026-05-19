import { applyD1Migrations, env, SELF } from 'cloudflare:test';
import { beforeAll } from 'vitest';

const base = 'http://127.0.0.1:8787';

beforeAll(async () => {
    // Apply migrations before running any tests
    // @ts-ignore
    await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
    // Setup database
    const response = await SELF.fetch(`${base}/init`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.SYSTEM}`
        },
    });
    if (![200, 201].includes(response.status)) {
        throw new Error('Failed to initialize database');
    }
});
