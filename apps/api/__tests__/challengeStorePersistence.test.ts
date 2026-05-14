import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db/challengeRepository', () => ({
  insertChallengeToDb: vi.fn(),
  consumeChallengeFromDb: vi.fn(),
}));

import { createChallenge, consumeChallenge, _clearChallengeStore } from '../src/auth/challengeStore';
import { insertChallengeToDb, consumeChallengeFromDb } from '../src/db/challengeRepository';

const mockInsert = vi.mocked(insertChallengeToDb);
const mockConsume = vi.mocked(consumeChallengeFromDb);

beforeEach(() => {
  _clearChallengeStore();
  mockInsert.mockReset();
  mockConsume.mockReset();
});

describe('challengeStore persistence boundary', () => {
  it('persists newly created challenges when the repository accepts them', async () => {
    mockInsert.mockResolvedValue(true);

    const challenge = await createChallenge('0xabc');

    expect(mockInsert).toHaveBeenCalledWith(challenge);
  });

  it('uses a persisted challenge when the repository returns one', async () => {
    const persisted = {
      challengeId: 'challenge-1',
      walletAddress: '0xabc',
      message: 'server-issued-message',
      expiresAt: new Date(Date.now() + 60_000),
    };
    mockConsume.mockResolvedValue({ ok: true, challenge: persisted });

    const result = await consumeChallenge('challenge-1', '0xabc');

    expect(mockConsume).toHaveBeenCalledWith('challenge-1', '0xabc');
    expect(result).toEqual({ ok: true, challenge: persisted });
  });

  it('marks the local fallback used after persisted consumption succeeds', async () => {
    mockInsert.mockResolvedValue(true);
    const challenge = await createChallenge('0xabc');
    mockConsume.mockResolvedValueOnce({ ok: true, challenge });

    const first = await consumeChallenge(challenge.challengeId, '0xabc');
    mockConsume.mockRejectedValueOnce(new Error('db down'));
    const second = await consumeChallenge(challenge.challengeId, '0xabc');

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe('already_used');
  });
});
