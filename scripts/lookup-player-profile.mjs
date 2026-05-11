/**
 * Phase 10C / 09L.1 — Sui PlayerProfile resolution (reference implementation)
 *
 * Resolves a wallet address to EVE Frontier character identity via two on-chain lookups:
 *   1. wallet → PlayerProfile (wallet-owned object) → character_id (Sui object address)
 *   2. character_id → Character (shared object) → item_id, name, tribe_id
 *
 * No CCP JWT required. No blockchain gateway. Fully public Sui testnet data.
 *
 * Confirmed working on Stillness (2026-05-11):
 *   - Package: 0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c
 *   - GraphQL: https://graphql.testnet.sui.io/graphql
 *
 * Run: node scripts/lookup-player-profile.mjs [wallet_address]
 */

const WALLET =
  process.argv[2] ??
  '0xabff3b1b9c793cf42f64864b80190fd836ac68391860c0d27491f3ef2fb4430f';

const SUI_GRAPHQL = 'https://graphql.testnet.sui.io/graphql';

async function graphql(query) {
  const res = await fetch(SUI_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors, null, 2));
  return data.data;
}

// ── Step 1: find PlayerProfile owned by wallet ────────────────────────────────
// We do NOT hardcode the package ID — it changes on upgrades.
// Instead we scan all owned objects and match by struct name.

console.log(`Resolving character for wallet: ${WALLET}\n`);

const ownedData = await graphql(`{
  address(address: "${WALLET}") {
    objects(first: 50) {
      nodes {
        address
        contents {
          type { repr }
          json
        }
      }
    }
  }
}`);

const allObjects = ownedData?.address?.objects?.nodes ?? [];
const profileObj = allObjects.find((n) =>
  n.contents?.type?.repr?.includes('::character::PlayerProfile')
);

if (!profileObj) {
  console.error('No PlayerProfile found for this wallet.');
  console.error('Possible reasons:');
  console.error('  - Wallet has no EVE character on Stillness');
  console.error('  - Character was created under a package not yet searched');
  process.exit(1);
}

const packageId = profileObj.contents.type.repr.split('::')[0];
const characterObjectId = profileObj.contents.json?.character_id;

console.log('PlayerProfile found:');
console.log('  Object:      ', profileObj.address);
console.log('  Package ID:  ', packageId);
console.log('  character_id:', characterObjectId);
console.log();

// ── Step 2: resolve Character shared object ───────────────────────────────────

const characterData = await graphql(`{
  object(address: "${characterObjectId}") {
    address
    asMoveObject {
      contents {
        type { repr }
        json
      }
    }
  }
}`);

const char = characterData?.object?.asMoveObject?.contents?.json;

if (!char) {
  console.error('Character object not found or not a MoveObject at:', characterObjectId);
  process.exit(1);
}

console.log('Character resolved:');
console.log('  EVE item_id:      ', char.key?.item_id);
console.log('  Name:             ', char.metadata?.name);
console.log('  tribe_id:         ', char.tribe_id);
console.log('  character_address:', char.character_address);
console.log('  tenant:           ', char.key?.tenant);
console.log('  assembly_id:      ', char.metadata?.assembly_id);
console.log();
console.log('Full Character JSON:');
console.log(JSON.stringify(char, null, 2));
