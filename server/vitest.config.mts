// @ts-ignore
import { defineWorkersProject, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { resolve } from 'node:path';

export default defineWorkersProject(async () => {
    // Read all migrations in the `migrations` directory
    const migrationsPath = resolve(__dirname, 'migrations');
    const migrations = await readD1Migrations(migrationsPath);

    return {
        test: {
            globals: true,
            setupFiles: [resolve(__dirname, 'test/setup.ts')],
            poolOptions: {
                workers: {
                    singleWorker: true,
                    wrangler: {
                        configPath: resolve(__dirname, 'wrangler.toml'),
                        environment: 'dev'
                    },
                    miniflare: {
                        // Add a test-only binding for migrations
                        bindings: { TEST_MIGRATIONS: migrations }
                    }
                }
            },
            testTimeout: 10000,
            hookTimeout: 10000,
            alias: {
                'google-auth-library': resolve(__dirname, 'test/mocks/google-auth.ts'),
                '@sendgrid/mail': resolve(__dirname, 'test/mocks/sendgrid.ts')
            }
        }
    };
});
