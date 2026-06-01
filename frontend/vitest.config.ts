import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./lib/vitest.setup.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        '.next/',
        'e2e/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
