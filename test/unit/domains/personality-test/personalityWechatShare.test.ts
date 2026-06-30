import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n', () => ({
  t: vi.fn((key: string, params?: Record<string, string>) => {
    if (key === 'personality.shareTitle' && params?.label) {
      return `测测你的本命 DJ · ${params.label}`;
    }
    if (key === 'personality.raverPersonality') {
      return '电音人格测试';
    }
    if (key === 'personality.shareFallbackSuffix') {
      return '测测你的电音人格 — We Are One';
    }
    return key;
  }),
}));

vi.mock('@/utils/plurShareImage.util', () => ({
  buildPlurPeaceShareImageUrl: () => 'peace-share-cover',
}));

vi.mock('@/utils/route', () => ({
  ROUTES: {
    PERSONALITY_TEST: '/packageEvent/pages/personality-test/index',
  },
}));

import {
  buildPersonalityTestShareAppMessage,
  buildPersonalityTestSharePath,
  buildPersonalityTestShareTitle,
  parsePersonalityTestShareQuery,
} from '@/domains/personality-test/utils/personalityWechatShare.util';
import type { PersonalityTestResult } from '@/domains/personality-test/types';

function mockResult(
  overrides: Partial<PersonalityTestResult> = {},
): PersonalityTestResult {
  return {
    version: 1,
    completedAt: '2026-01-01T00:00:00.000Z',
    answers: {},
    score: {
      primaryType: 'vibe_curator',
      scores: {
        rager: 0,
        connoisseur: 0,
        vibe_curator: 10,
        zen_raver: 0,
        documentarian: 0,
      },
    },
    recommendations: {
      soulMatch: {
        djId: 'martin-garrix',
        djName: 'Martin Garrix',
        genreLabel: 'Big Room',
        matchScore: 92,
        soulSimilarity: 0.92,
        tier: 'must_see',
        dimensionBreakdown: { E: 1, M: 1, S: 1, C: 1 },
      },
      mustSee: [],
      recommended: [],
      challenge: [],
    },
    recommendedEvents: [],
    narrative: {
      tagline: 'test',
      aiAnalysis: 'test',
      spiritConnections: [],
    },
    ...overrides,
  };
}

describe('personalityWechatShare', () => {
  it('builds share title and path with share params', () => {
    const result = mockResult();
    expect(buildPersonalityTestShareTitle(result)).toContain('本命 DJ');
    const path = buildPersonalityTestSharePath(result);
    expect(path).toContain('share=1');
    expect(path).toContain('primaryType=vibe_curator');
    expect(path).toContain('soulDjId=martin-garrix');
  });

  it('builds share app message with Peace cover', () => {
    const result = mockResult();
    const message = buildPersonalityTestShareAppMessage(result);
    expect(message.title).toContain('本命 DJ');
    expect(message.path).toContain('share=1');
    expect(message.imageUrl).toBeTruthy();
  });

  it('parses valid share query', () => {
    expect(
      parsePersonalityTestShareQuery({
        share: '1',
        primaryType: 'rager',
        soulDjId: 'skrillex',
      }),
    ).toEqual({
      primaryType: 'rager',
      soulDjId: 'skrillex',
    });
  });

  it('rejects invalid share query', () => {
    expect(
      parsePersonalityTestShareQuery({ share: '1', primaryType: 'invalid' }),
    ).toBeNull();
    expect(parsePersonalityTestShareQuery({ primaryType: 'rager' })).toBeNull();
  });
});
