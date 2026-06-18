import { describe, expect, it } from 'vitest';
import {
  ensurePersonalityResultNickname,
  generatePersonalityNickname,
  PERSONALITY_NICKNAME_CORES,
  PERSONALITY_NICKNAME_PREFIXES,
  PERSONALITY_NICKNAME_SUFFIXES,
} from '@/domains/personality-test/utils/personalityNickname.util';
import type {
  PersonalityTestResult,
  RaverPersonalityType,
} from '@/domains/personality-test/types';

const ALL_TYPES: RaverPersonalityType[] = [
  'rager',
  'connoisseur',
  'vibe_curator',
  'zen_raver',
  'documentarian',
];

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

describe('personalityNickname.util', () => {
  it('defines nickname cores for every personality type', () => {
    for (const type of ALL_TYPES) {
      expect(PERSONALITY_NICKNAME_CORES[type].length).toBeGreaterThan(0);
    }
  });

  it('generates nickname from prefix, core, suffix, and id pools', () => {
    let seq = 0;
    const random = () => {
      const values = [0, 0, 0, 0, 0, 0, 0, 0];
      return values[seq++ % values.length] ?? 0;
    };

    expect(generatePersonalityNickname('connoisseur', random)).toBe('小滤波酱AAAA');
  });

  it('appends a 4-character alphanumeric id suffix', () => {
    const nickname = generatePersonalityNickname('rager');
    expect(nickname).toMatch(/[A-Z0-9]{4}$/);
  });

  it('covers all personality types with non-empty nicknames', () => {
    for (const type of ALL_TYPES) {
      const nickname = generatePersonalityNickname(type, () => 0);
      expect(nickname.length).toBeGreaterThanOrEqual(7);
      const core = PERSONALITY_NICKNAME_CORES[type][0];
      const prefix = PERSONALITY_NICKNAME_PREFIXES[0];
      const suffix = PERSONALITY_NICKNAME_SUFFIXES[0];
      expect(nickname).toBe(`${prefix}${core}${suffix}AAAA`);
    }
  });

  it('preserves nickname that already uses the current format', () => {
    const existing = { ...baseResult, raverNickname: '小滤波酱A1B2' };
    expect(ensurePersonalityResultNickname(existing).raverNickname).toBe(
      '小滤波酱A1B2',
    );
  });

  it('regenerates legacy nickname without id suffix', () => {
    const legacy = { ...baseResult, raverNickname: '小滤波酱' };
    const next = ensurePersonalityResultNickname(legacy);
    expect(next.raverNickname).not.toBe('小滤波酱');
    expect(next.raverNickname).toMatch(/[A-Z0-9]{4}$/);
  });

  it('assigns nickname when missing', () => {
    const next = ensurePersonalityResultNickname(baseResult);
    expect(next.raverNickname?.length).toBeGreaterThan(0);
  });
});
