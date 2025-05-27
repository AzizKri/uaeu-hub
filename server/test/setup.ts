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
    if (response.status !== 201) {
        throw new Error('Failed to initialize database');
    }
});
