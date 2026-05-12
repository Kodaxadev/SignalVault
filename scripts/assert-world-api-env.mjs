import { validateWorldApiEnv } from './world-api-env-policy.mjs';

const result = validateWorldApiEnv();

if (!result.ok) {
  for (const error of result.errors) {
    console.error(`❌ ${error}`);
  }
  console.error('\nWorld API environment check failed.');
  process.exit(1);
}

console.log('✅ World API environment configuration is release-safe.');
