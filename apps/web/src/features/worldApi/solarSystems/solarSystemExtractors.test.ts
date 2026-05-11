import { describe, it, expect } from 'vitest';
import { extractSolarSystem, extractSolarSystemList } from './solarSystemExtractors';

describe('solarSystemExtractors', () => {
  it('extracts valid solar system detail', () => {
    const raw = {
      id: 30000001,
      name: 'A 2560',
      constellationId: 20000001,
      regionId: 10000001,
      location: { x: 1, y: 2, z: 3 },
      gateLinks: [30000002, 30000003],
    };

    const result = extractSolarSystem(raw);
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data).toMatchObject({
      id: '30000001',
      name: 'A 2560',
      constellationId: '20000001',
      connectedSystemIds: ['30000002', '30000003'],
    });
  });

  it('handles missing gateLinks gracefully', () => {
    const raw = {
      id: 1,
      name: 'Test',
      constellationId: 100,
      regionId: 200,
    };

    const result = extractSolarSystem(raw);
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data.connectedSystemIds).toEqual([]);
  });

  it('returns unavailable for invalid response', () => {
    const result = extractSolarSystem({ invalid: true });
    expect(result.status).toBe('unavailable');
  });

  it('extracts solar system list', () => {
    const raw = {
      data: [
        { id: 1, name: 'System A', constellationId: 100, regionId: 200 },
        { id: 2, name: 'System B', constellationId: 100, regionId: 200 },
      ],
      metadata: { total: 2, limit: 100, offset: 0 },
    };

    const result = extractSolarSystemList(raw);
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data).toHaveLength(2);
  });
});
