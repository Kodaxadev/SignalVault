import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // AUTH_DEV_MODE bypasses crypto verification in tests.
    // Never set this in a production environment.
    env: {
      AUTH_DEV_MODE: 'true',
    },
  },
});
