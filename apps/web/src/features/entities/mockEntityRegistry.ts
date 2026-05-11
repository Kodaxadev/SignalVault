import { createClaim } from '@/features/entities/entityClassificationTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';

// Pre-seeded mock registry entries for testing priority rules
const MOCK_ENTRIES: Array<{
  key: string;
  type: Parameters<typeof createClaim>[1];
  label: string;
}> = [
  {
    key: 'item:utopia:12345',
    type: 'smart_gate',
    label: 'Gate Alpha-7',
  },
  {
    key: 'item:utopia:99999',
    type: 'smart_storage_unit',
    label: 'Storage Hub Beta',
  },
  {
    key: 'object:test:0xabc',
    type: 'market',
    label: 'Market Omega',
  },
];

export function resolveFromMockRegistry(entityKey: string): EntityClassificationClaim[] {
  const entry = MOCK_ENTRIES.find((e) => e.key === entityKey);
  if (!entry) return [];

  return [
    createClaim(entityKey, entry.type, 'mock_registry', {
      objectId: entityKey.startsWith('object:') ? entityKey.split(':').pop() : undefined,
      itemId: entityKey.startsWith('item:') ? entityKey.split(':').pop() : undefined,
      tenant: entityKey.split(':')[1] !== 'unknown' ? entityKey.split(':')[1] : undefined,
    }, entry.label),
  ];
}
