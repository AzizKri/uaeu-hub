import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        cloudflareTest(async () => {
            const migrations = await readD1Migrations(resolve(projectRoot, 'migrations'));

            return {
                wrangler: {
                    configPath: resolve(projectRoot, 'wrangler.toml'),
                    environment: 'dev'
                },
                miniflare: {
                    // Add a test-only binding for migrations.
                    bindings: { TEST_MIGRATIONS: migrations }
                }
            };
        })
    ],
    test: {
        globals: true,
        setupFiles: [resolve(projectRoot, 'test/setup.ts')],
        testTimeout: 10000,
        hookTimeout: 10000,
        alias: {
            'google-auth-library': resolve(projectRoot, 'test/mocks/google-auth.ts'),
            '@sendgrid/mail': resolve(projectRoot, 'test/mocks/sendgrid.ts')
        }
    }
});
