import { describe, it, expect } from 'vitest';
import { extractTribe, extractTribeList } from './tribeExtractors';

describe('tribeExtractors', () => {
  it('extracts valid tribe detail', () => {
    const raw = {
      id: 98000010,
      name: 'Static Conclave',
      nameShort: 'SCON',
      description: 'The immutable authority.',
      taxRate: 0,
      tribeUrl: '',
    };

    const result = extractTribe(raw);
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data).toMatchObject({
      id: '98000010',
      name: 'Static Conclave',
      nameShort: 'SCON',
      description: 'The immutable authority.',
    });
  });

  it('returns unavailable for invalid response', () => {
    const result = extractTribe({ noId: true });
    expect(result.status).toBe('unavailable');
  });

  it('extracts tribe list', () => {
    const raw = {
      data: [
        { id: 1, name: 'Tribe A' },
        { id: 2, name: 'Tribe B' },
      ],
      metadata: { total: 2, limit: 100, offset: 0 },
    };

    const result = extractTribeList(raw);
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data).toHaveLength(2);
  });
});
