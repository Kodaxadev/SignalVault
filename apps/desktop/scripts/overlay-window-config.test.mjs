import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const config = JSON.parse(
  await readFile(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'),
);

const [mainWindow] = config.app.windows;

test('desktop window declares compact overlay behavior', () => {
  assert.equal(mainWindow.label, 'main');
  assert.equal(mainWindow.alwaysOnTop, true);
  assert.equal(mainWindow.decorations, false);
  assert.equal(mainWindow.resizable, false);
  assert.equal(mainWindow.fullscreen, false);
  assert.equal(mainWindow.width, 360);
  assert.equal(mainWindow.height, 460);
});

test('desktop window starts in a gameplay-friendly corner', () => {
  assert.equal(mainWindow.x, 24);
  assert.equal(mainWindow.y, 24);
});

test('desktop bundle metadata declares alpha app identity', () => {
  assert.equal(config.productName, 'Signal Vault Companion');
  assert.equal(config.identifier, 'dev.signalvault.companion');
  assert.equal(config.bundle.publisher, 'Signal Vault');
  assert.deepEqual(config.bundle.icon, ['icons/icon.ico']);
  assert.match(config.bundle.shortDescription, /desktop companion/);
});
