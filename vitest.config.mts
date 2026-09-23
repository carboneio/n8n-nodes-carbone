import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

// Deterministic timestamps in tests, same as n8n core
process.env.TZ = 'UTC';

export default defineConfig({
	resolve: {
		// Pin n8n-workflow to its CJS build so instanceof checks on its error classes stay reliable
		alias: [{ find: /^n8n-workflow$/, replacement: require.resolve('n8n-workflow') }],
	},
	test: {
		environment: 'node',
		include: ['__tests__/**/*.test.ts'],
		restoreMocks: true,
		clearMocks: true,
	},
});
