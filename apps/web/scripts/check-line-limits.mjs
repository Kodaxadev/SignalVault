import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_LINES = 400;
const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
const SRC_DIR = join(SCRIPT_DIR, '..', 'src');

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      yield full;
    }
  }
}

let violations = 0;

for await (const file of walk(SRC_DIR)) {
  const content = await readFile(file, 'utf8');
  const lines = content.split('\n').length;
  if (lines > MAX_LINES) {
    const relative = file.replace(SRC_DIR, 'src/').replace(/\\/g, '/');
    console.error(`❌ ${relative}: ${lines} lines (max ${MAX_LINES})`);
    violations++;
  }
}

if (violations === 0) {
  console.log(`✅ All files under ${MAX_LINES} lines.`);
} else {
  console.error(`\n${violations} file(s) exceed the ${MAX_LINES}-line limit.`);
  process.exit(1);
}
