import { describe, expect, it } from 'vitest';
import { buildPersonalityBuddyPostPrefill } from '@/domains/personality-test/utils/buildPersonalityBuddyPostPrefill';
import type { PersonalityTestCatalog } from '@/domains/personality-test/personalityTestCatalog';
import type { PersonalityTestResult } from '@/domains/personality-test/types';

const catalog = {
  types: [
    {
      type: 'vibe_curator',
      emoji: '🎭',
      label: '气氛组选手',
      labelEn: 'The Vibe Curator',
      description: '爱拍照、重社交',
      genreTags: ['Tech House', 'Brazilian Bass', 'House'],
      primaryColor: '#ff4d94',
      targetVector: { E: 65, M: 40, S: 95, C: 60 },
      dimensionWeights: { E: 0.2, M: 0.1, S: 0.45, C: 0.25 },
    },
  ],
  djs: [],
  soulProfiles: {},
} as unknown as PersonalityTestCatalog;

const result = {
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
      djId: 'marshmello',
      djName: 'MARSHMELLO',
      genreLabel: 'Breakbeat',
      matchScore: 85,
      soulSimilarity: 77,
      tier: 'must_see',
      dimensionBreakdown: { E: 1, M: 1, S: 1, C: 1 },
    },
    mustSee: [],
    recommended: [],
    challenge: [],
  },
  narrative: {
    tagline: 'test',
    aiAnalysis: 'test',
    spiritConnections: [],
  },
  recommendedEvents: [],
} as PersonalityTestResult;

describe('buildPersonalityBuddyPostPrefill', () => {
  it('prefills buddy post from personality result and target event', () => {
    const prefill = buildPersonalityBuddyPostPrefill(
      result,
      {
        activityLegacyId: 8,
        name: 'EDC Korea 2026',
        dateLabel: '10/03-04/2026',
        location: '仁川 Inspire',
        matchedDjs: ['MARSHMELLO'],
        matchScore: 90,
        reason: '阵容含 MARSHMELLO',
      },
      catalog,
    );

    expect(prefill.bannerTitle).toBe('人格测试 · 组队预填');
    expect(prefill.form.dateStart).toBe('2026-10-03');
    expect(prefill.form.dateEnd).toBe('2026-10-04');
    expect(prefill.form.location).toBe('仁川 Inspire');
    expect(prefill.form.headcount).toBe('2');
    expect(prefill.form.tags).toEqual(['team']);
    expect(prefill.form.note).toContain('Tech House');
    expect(prefill.form.note).toContain('MARSHMELLO');
    expect(prefill.summaryLines).toEqual([
      'EDC Korea 2026',
      '10/03-04/2026',
      '仁川 Inspire',
      prefill.form.note,
    ]);
  });
});
