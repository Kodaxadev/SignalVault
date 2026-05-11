import { describe, it, expect } from 'vitest';
import { extractGameType, extractGameTypeList } from './gameTypeExtractors';

describe('gameTypeExtractors', () => {
  it('extracts valid game type detail', () => {
    const raw = {
      id: 77917,
      name: 'Heavy Storage',
      description: 'A programmable storage unit.',
      groupId: 0,
      groupName: 'Storage',
      categoryId: 22,
      categoryName: 'Deployable',
      iconUrl: '',
    };

    const result = extractGameType(raw);
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data).toMatchObject({
      id: '77917',
      name: 'Heavy Storage',
      groupName: 'Storage',
      categoryName: 'Deployable',
    });
  });

  it('returns unavailable for invalid response', () => {
    const result = extractGameType({ noId: true });
    expect(result.status).toBe('unavailable');
  });

  it('extracts game type list', () => {
    const raw = {
      data: [
        { id: 1, name: 'Type A' },
        { id: 2, name: 'Type B' },
      ],
      metadata: { total: 2, limit: 100, offset: 0 },
    };

    const result = extractGameTypeList(raw);
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data).toHaveLength(2);
  });
});
