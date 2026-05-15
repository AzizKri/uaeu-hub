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
                    bindings: {
                        TEST_MIGRATIONS: migrations,
                        EN_SECRET: 'test_encryption_secret',
                        PASSWORD_PEPPER: 'test_password_pepper',
                        EMAIL_SEND_DISABLED: 'true',
                        RESEND_API_KEY: 'test_resend_key',
                        AUTH_EMAIL_FROM: 'UAEU Chat <no-reply@uaeu.chat>',
                        PUBLIC_APP_URL: 'http://127.0.0.1:5173'
                    }
                }
            };
        })
    ],
    test: {
        globals: true,
        setupFiles: [resolve(projectRoot, 'test/setup.ts')],
        testTimeout: 10000,
        hookTimeout: 10000
    }
});
