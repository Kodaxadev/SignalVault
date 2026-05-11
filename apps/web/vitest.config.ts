import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/app': resolve(root, 'src/app'),
      '@/features': resolve(root, 'src/features'),
      '@/lib': resolve(root, 'src/lib'),
      '@evefrontier/dapp-kit': resolve(root, 'src/lib/evefrontier-stub.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
  },
});
