import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';

const releaseExe = new URL(
  '../src-tauri/target/release/signal-vault-desktop.exe',
  import.meta.url,
);
const releaseExePath = fileURLToPath(releaseExe);
const bridgeUrl = 'http://127.0.0.1:17777/state';
const tokenPath = path.join(
  process.env.APPDATA ?? '',
  'dev.signalvault.companion',
  'bridge-token.txt',
);

test('packaged Windows exe launches and hosts the bridge', async () => {
  assert.equal(existsSync(releaseExe), true, 'release exe is missing');

  await assertPortIsFree();
  const firstRun = await launchAndCheckBridge();
  assert.match(firstRun.token, /^[a-fA-F0-9]{64}$/);

  await assertPortIsFree();
  const secondRun = await launchAndCheckBridge();
  assert.equal(secondRun.token, firstRun.token, 'pairing token changed after restart');
});

async function launchAndCheckBridge() {
  const child = spawn(releaseExePath, [], {
    stdio: 'ignore',
    windowsHide: true,
  });

  try {
    await delay(3000);
    assert.equal(child.exitCode, null, 'release exe exited during smoke test');

    const response = await fetch(bridgeUrl);
    assert.ok(
      [200, 503].includes(response.status),
      `unexpected bridge status ${response.status}`,
    );
    const token = await readFile(tokenPath, 'utf8');
    return { token: token.trim() };
  } finally {
    child.kill();
    await delay(750);
  }
}

async function assertPortIsFree() {
  try {
    const response = await fetch(bridgeUrl);
    assert.fail(`bridge port is already in use with status ${response.status}`);
  } catch (error) {
    if (error instanceof TypeError) return;
    throw error;
  }
}
