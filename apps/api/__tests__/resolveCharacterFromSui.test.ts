import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveCharacterFromSui } from '../src/character/resolveCharacterFromSui';

// Mock the Sui GraphQL client so tests never hit the network.
vi.mock('../src/character/suiGraphqlClient', () => ({
  suiGraphqlQuery: vi.fn(),
}));

import { suiGraphqlQuery } from '../src/character/suiGraphqlClient';
const mockQuery = vi.mocked(suiGraphqlQuery);

const WALLET = '0xabff3b1b9c793cf42f64864b80190fd836ac68391860c0d27491f3ef2fb4430f';
const ENDPOINT = 'https://graphql.testnet.sui.io/graphql';

const OWNED_OBJECTS_RESPONSE = {
  data: {
    address: {
      objects: {
        nodes: [
          {
            address: '0xprofile',
            contents: {
              type: {
                repr: '0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::character::PlayerProfile',
              },
              json: { id: '0xprofile', character_id: '0xcharacter' },
            },
          },
        ],
      },
    },
  },
};

const CHARACTER_OBJECT_RESPONSE = {
  data: {
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
            character_address: WALLET,
            metadata: { assembly_id: '0xcharacter', name: 'Kivik', description: '', url: '' },
            owner_cap_id: '0xownercap',
          },
        },
      },
    },
  },
};

beforeEach(() => {
  mockQuery.mockReset();
});

describe('resolveCharacterFromSui', () => {
  it('resolves character from wallet with PlayerProfile + Character', async () => {
    mockQuery
      .mockResolvedValueOnce(OWNED_OBJECTS_RESPONSE)
      .mockResolvedValueOnce(CHARACTER_OBJECT_RESPONSE);

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.character.characterItemId).toBe('2112089652');
    expect(result.character.characterName).toBe('Kivik');
    expect(result.character.tribeId).toBe(1000167);
    expect(result.character.characterAddress).toBe(WALLET);
    expect(result.character.tenant).toBe('stillness');
    expect(result.profile.packageId).toBe(
      '0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c'
    );
  });

  it('character_id in PlayerProfile is treated as a Sui object address', async () => {
    mockQuery
      .mockResolvedValueOnce(OWNED_OBJECTS_RESPONSE)
      .mockResolvedValueOnce(CHARACTER_OBJECT_RESPONSE);

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // profile.characterObjectId = the Sui object address (NOT the EVE numeric ID)
    expect(result.profile.characterObjectId).toBe('0xcharacter');
    // characterItemId = the EVE numeric ID from Character.key.item_id
    expect(result.character.characterItemId).toBe('2112089652');
  });

  it('returns no_player_profile when wallet has no PlayerProfile', async () => {
    mockQuery.mockResolvedValueOnce({
      data: { address: { objects: { nodes: [] } } },
    });

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('no_player_profile');
  });

  it('returns character_object_not_found when Character object is malformed', async () => {
    mockQuery
      .mockResolvedValueOnce(OWNED_OBJECTS_RESPONSE)
      .mockResolvedValueOnce({ data: { object: null } });

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('character_object_not_found');
  });

  it('returns wallet_address_mismatch when Character.character_address differs', async () => {
    const mismatchedCharacter = structuredClone(CHARACTER_OBJECT_RESPONSE);
    mismatchedCharacter.data.object.asMoveObject.contents.json.character_address =
      '0xdifferentwallet';

    mockQuery
      .mockResolvedValueOnce(OWNED_OBJECTS_RESPONSE)
      .mockResolvedValueOnce(mismatchedCharacter);

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('wallet_address_mismatch');
  });

  it('wallet address comparison is case-insensitive', async () => {
    const upperCaseCharacter = structuredClone(CHARACTER_OBJECT_RESPONSE);
    upperCaseCharacter.data.object.asMoveObject.contents.json.character_address =
      WALLET.toUpperCase();

    mockQuery
      .mockResolvedValueOnce(OWNED_OBJECTS_RESPONSE)
      .mockResolvedValueOnce(upperCaseCharacter);

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);
    expect(result.ok).toBe(true);
  });

  it('returns graphql_error when owned objects query returns errors', async () => {
    mockQuery.mockResolvedValueOnce({
      errors: [{ message: 'Unknown field "foo" on type "Bar"' }],
    });

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('graphql_error');
  });

  it('returns network_error when fetch throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'));

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('network_error');
  });

  it('package ID changes are accepted via type repr detection', async () => {
    const upgradedPackage = structuredClone(OWNED_OBJECTS_RESPONSE);
    const newPkg = '0xnewpackageid1234567890abcdef';
    upgradedPackage.data.address.objects.nodes[0]!.contents.type.repr =
      `${newPkg}::character::PlayerProfile`;

    mockQuery
      .mockResolvedValueOnce(upgradedPackage)
      .mockResolvedValueOnce(CHARACTER_OBJECT_RESPONSE);

    const result = await resolveCharacterFromSui(WALLET, ENDPOINT);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile.packageId).toBe(newPkg);
  });
});
