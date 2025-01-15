import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const base = 'http://127.0.0.1:8787'

describe('Server status', () => {
    it('responds with OK', async () => {
        const response = await SELF.fetch(base)
        expect(await response.text()).toBe('OK');
    });

    it('responds with the current environment', async () => {
        const response = await SELF.fetch(base + '/env');

        const expectedResponses = ['development', 'production']
        expect(expectedResponses).toContain(await response.text())
    })
});
