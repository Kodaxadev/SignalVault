import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const cargoToml = await readFile(
  new URL('../src-tauri/Cargo.toml', import.meta.url),
  'utf8',
);
const trayRs = await readFile(
  new URL('../src-tauri/src/tray.rs', import.meta.url),
  'utf8',
);

test('Tauri tray feature is enabled', () => {
  assert.match(cargoToml, /features = \["tray-icon"\]/);
});

test('desktop tray menu uses stable action ids', () => {
  for (const id of [
    'show_overlay',
    'hide_overlay',
    'toggle_overlay',
    'open_vault',
    'quit',
  ]) {
    assert.match(trayRs, new RegExp(`"${id}"`));
  }
});

test('disabled tray actions remain disabled', () => {
  assert.match(
    trayRs,
    /MenuItem::with_id\(app,\s*OPEN_VAULT,\s*"Open Vault",\s*false/,
  );
});

test('tray handlers target only window or app controls', () => {
  assert.match(trayRs, /window\.show\(\)\?/);
  assert.match(trayRs, /window\.hide\(\)\?/);
  assert.match(trayRs, /app\.exit\(0\)/);
});
