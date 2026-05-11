import { describe, it, expect } from 'vitest';
import {
  extractPlayerProfile,
  extractCharacter,
} from '../src/character/suiCharacterExtractors';

// ── extractPlayerProfile ──────────────────────────────────────────────────────

const VALID_PROFILE_NODE = {
  address: '0xprofile',
  contents: {
    type: {
      repr: '0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::character::PlayerProfile',
    },
    json: {
      id: '0xprofile',
      character_id: '0xcharacter',
    },
  },
};

describe('extractPlayerProfile', () => {
  it('returns null for non-array input', () => {
    expect(extractPlayerProfile(null)).toBeNull();
    expect(extractPlayerProfile(undefined)).toBeNull();
    expect(extractPlayerProfile({})).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(extractPlayerProfile([])).toBeNull();
  });

  it('returns null when no node has PlayerProfile type', () => {
    const nodes = [
      {
        address: '0xfoo',
        contents: {
          type: { repr: '0x2::coin::Coin<0x2::sui::SUI>' },
          json: { balance: '1000' },
        },
      },
    ];
    expect(extractPlayerProfile(nodes)).toBeNull();
  });

  it('extracts PlayerProfile from a valid node', () => {
    const result = extractPlayerProfile([VALID_PROFILE_NODE]);
    expect(result).not.toBeNull();
    expect(result?.objectAddress).toBe('0xprofile');
    expect(result?.characterObjectId).toBe('0xcharacter');
    expect(result?.packageId).toBe(
      '0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c'
    );
  });

  it('finds PlayerProfile among mixed object types', () => {
    const nodes = [
      {
        address: '0xcoin',
        contents: { type: { repr: '0x2::coin::Coin<0x2::sui::SUI>' }, json: {} },
      },
      VALID_PROFILE_NODE,
    ];
    const result = extractPlayerProfile(nodes);
    expect(result?.objectAddress).toBe('0xprofile');
  });

  it('returns null when character_id is missing from json', () => {
    const node = {
      address: '0xprofile',
      contents: {
        type: { repr: '0x28b4::character::PlayerProfile' },
        json: { id: '0xprofile' }, // no character_id
      },
    };
    expect(extractPlayerProfile([node])).toBeNull();
  });

  it('returns null when address is missing', () => {
    const node = {
      contents: {
        type: { repr: '0x28b4::character::PlayerProfile' },
        json: { character_id: '0xcharacter' },
      },
    };
    expect(extractPlayerProfile([node])).toBeNull();
  });
});

// ── extractCharacter ──────────────────────────────────────────────────────────

const VALID_CHARACTER_DATA = {
  object: {
    address: '0xcharacter',
    asMoveObject: {
      contents: {
        type: {
          repr: '0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::character::Character',
        },
        json: {
          id: '0xcharacter',
          key: { item_id: '2112089652', tenant: 'stillness' },
          tribe_id: 1000167,
          character_address: '0xwallet',
          metadata: {
            assembly_id: '0xcharacter',
            name: 'Kivik',
            description: '',
            url: '',
          },
          owner_cap_id: '0xownercap',
        },
      },
    },
  },
};

describe('extractCharacter', () => {
  it('returns null for null input', () => {
    expect(extractCharacter(null)).toBeNull();
    expect(extractCharacter(undefined)).toBeNull();
  });

  it('returns null when object is missing', () => {
    expect(extractCharacter({ other: 'data' })).toBeNull();
  });

  it('extracts all fields from a valid Character response', () => {
    const result = extractCharacter(VALID_CHARACTER_DATA);
    expect(result).not.toBeNull();
    expect(result?.characterObjectId).toBe('0xcharacter');
    expect(result?.characterItemId).toBe('2112089652');
    expect(result?.characterName).toBe('Kivik');
    expect(result?.tribeId).toBe(1000167);
    expect(result?.characterAddress).toBe('0xwallet');
    expect(result?.tenant).toBe('stillness');
  });

  it('returns null when tribe_id is a string instead of number', () => {
    const data = structuredClone(VALID_CHARACTER_DATA);
    data.object.asMoveObject.contents.json.tribe_id = '1000167' as unknown as number;
    expect(extractCharacter(data)).toBeNull();
  });

  it('returns null when item_id is missing', () => {
    const data = structuredClone(VALID_CHARACTER_DATA);
    (data.object.asMoveObject.contents.json.key as Record<string, unknown>)['item_id'] =
      undefined;
    expect(extractCharacter(data)).toBeNull();
  });

  it('returns null when name is missing', () => {
    const data = structuredClone(VALID_CHARACTER_DATA);
    (data.object.asMoveObject.contents.json.metadata as Record<string, unknown>)['name'] =
      undefined;
    expect(extractCharacter(data)).toBeNull();
  });

  it('returns null when character_address is missing', () => {
    const data = structuredClone(VALID_CHARACTER_DATA);
    (data.object.asMoveObject.contents.json as Record<string, unknown>)['character_address'] =
      undefined;
    expect(extractCharacter(data)).toBeNull();
  });

  it('returns null when asMoveObject is absent', () => {
    const data = { object: { address: '0xcharacter' } };
    expect(extractCharacter(data)).toBeNull();
  });
});
