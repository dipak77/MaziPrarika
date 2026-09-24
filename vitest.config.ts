import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const pkg = (name: string) => fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@mazi/marathi': pkg('marathi'),
      '@mazi/panchang': pkg('panchang'),
      '@mazi/design-schema': pkg('design-schema'),
      '@mazi/renderer': pkg('renderer'),
      '@mazi/commerce': pkg('commerce'),
      '@mazi/ai-gateway': pkg('ai-gateway'),
      '@mazi/store': pkg('store'),
      '@mazi/store/seed': fileURLToPath(new URL('./packages/store/src/seed.ts', import.meta.url)),
    },
  },
  test: {
    include: ['packages/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
    reporters: ['default'],
  },
});
