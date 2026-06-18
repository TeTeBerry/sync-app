import { describe, expect, it } from 'vitest';
import { RAVER_AVATAR_ASSET_KEYS } from '@/domains/personality-test/data/personalityRaverAvatarCatalog';
import {
  ensurePersonalityResultAvatar,
  generatePersonalityRaverAvatarKey,
} from '@/domains/personality-test/utils/personalityRaverAvatar.util';
import { ensurePersonalityResultIdentity } from '@/domains/personality-test/utils/personalityResultIdentity.util';
import type { PersonalityTestResult } from '@/domains/personality-test/types';

const baseResult: PersonalityTestResult = {
  version: 1,
  completedAt: '2026-01-01T00:00:00.000Z',
  answers: {},
  score: {
    primaryType: 'rager',
    scores: {
      rager: 90,
      connoisseur: 10,
      vibe_curator: 10,
      zen_raver: 10,
      documentarian: 10,
    },
  },
  recommendations: {
    soulMatch: {
      djId: 'dj-1',
      djName: 'Test DJ',
      genreLabel: 'Techno',
      matchScore: 90,
      soulSimilarity: 88,
      tier: 'must_see',
      dimensionBreakdown: { E: 1, M: 1, S: 1, C: 1 },
    },
    mustSee: [],
    recommended: [],
    challenge: [],
  },
  recommendedEvents: [],
  narrative: {
    tagline: 'tag',
    aiAnalysis: 'analysis',
    spiritConnections: [],
  },
};

describe('personalityRaverAvatar.util', () => {
  it('picks avatar keys from cloud avatar catalog', () => {
    expect(generatePersonalityRaverAvatarKey(() => 0)).toBe(RAVER_AVATAR_ASSET_KEYS[0]);
  });

  it('assigns avatar key when missing', () => {
    const next = ensurePersonalityResultAvatar(baseResult);
    expect(RAVER_AVATAR_ASSET_KEYS).toContain(next.raverAvatarKey);
  });

  it('preserves existing avatar key for current identity version', () => {
    const existing = {
      ...baseResult,
      raverAvatarKey: 'avatar/cat-cyan-headphones.png',
      raverIdentityVersion: 2,
    };
    expect(ensurePersonalityResultAvatar(existing).raverAvatarKey).toBe(
      'avatar/cat-cyan-headphones.png',
    );
  });

  it('re-randomizes avatar when migrating legacy identity', () => {
    const legacy = {
      ...baseResult,
      raverNickname: '小滤波酱A1B2',
      raverAvatarKey: 'avatar/03.webp',
    };
    const next = ensurePersonalityResultIdentity(legacy);
    expect(next.raverAvatarKey).not.toBe('avatar/03.webp');
    expect(RAVER_AVATAR_ASSET_KEYS).toContain(next.raverAvatarKey);
    expect(next.raverIdentityVersion).toBe(2);
    expect(next.raverNickname).toBe('小滤波酱A1B2');
  });

  it('preserves avatar after identity migration', () => {
    const current = {
      ...baseResult,
      raverNickname: '小滤波酱A1B2',
      raverAvatarKey: 'avatar/cat-cyan-headphones.png',
      raverIdentityVersion: 2,
    };
    const next = ensurePersonalityResultIdentity(current);
    expect(next.raverAvatarKey).toBe('avatar/cat-cyan-headphones.png');
    expect(next.raverNickname).toBe('小滤波酱A1B2');
  });

  it('assigns nickname and avatar together', () => {
    const next = ensurePersonalityResultIdentity(baseResult);
    expect(next.raverNickname?.length).toBeGreaterThan(0);
    expect(next.raverAvatarKey?.startsWith('avatar/')).toBe(true);
  });
});
