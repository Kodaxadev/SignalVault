import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);
const cargoToml = await readFile(
  new URL('../src-tauri/Cargo.toml', import.meta.url),
  'utf8',
);
const libRs = await readFile(
  new URL('../src-tauri/src/lib.rs', import.meta.url),
  'utf8',
);
const capability = JSON.parse(
  await readFile(
    new URL('../src-tauri/capabilities/default.json', import.meta.url),
    'utf8',
  ),
);

test('global shortcut plugin dependencies are declared', () => {
  assert.equal(
    packageJson.dependencies['@tauri-apps/plugin-global-shortcut'],
    '^2.3.1',
  );
  assert.match(cargoToml, /tauri-plugin-global-shortcut = "2"/);
});

test('global shortcut plugin is initialized for the desktop app', () => {
  assert.match(libRs, /tauri_plugin_global_shortcut::Builder::new\(\)/);
});

test('desktop permissions are scoped to the main window', () => {
  assert.deepEqual(capability.windows, ['main']);
  assert.deepEqual(capability.permissions, [
    'global-shortcut:allow-is-registered',
    'global-shortcut:allow-register',
    'global-shortcut:allow-unregister',
    'opener:allow-open-url',
  ]);
});
