import { describe, expect, it } from 'vitest';
import { buildPersonalityItinerarySelection } from '@/domains/personality-test/utils/buildPersonalityItinerarySelection';
import type { PersonalityTestResult } from '@/domains/personality-test/types';

function dj(id: string, name: string, tier: 'must_see' | 'recommended' = 'must_see') {
  return {
    djId: id,
    djName: name,
    genreLabel: 'House',
    matchScore: 80,
    soulSimilarity: 75,
    tier,
    dimensionBreakdown: { E: 1, M: 1, S: 1, C: 1 },
  };
}

const baseResult = {
  version: 1,
  completedAt: '2026-01-01T00:00:00.000Z',
  answers: {},
  score: {
    primaryType: 'rager',
    scores: {
      rager: 10,
      connoisseur: 0,
      vibe_curator: 0,
      zen_raver: 0,
      documentarian: 0,
    },
  },
  narrative: {
    tagline: 'test',
    aiAnalysis: 'test',
    spiritConnections: [
      { role: 'soul', djName: 'MARSHMELLO' },
      { role: 'aligned', djName: 'CARTA' },
      { role: 'aligned', djName: 'DENNETT' },
    ],
  },
} as PersonalityTestResult;

describe('buildPersonalityItinerarySelection', () => {
  it('selects spirit-connection djs that appear in the target event lineup', () => {
    const result = {
      ...baseResult,
      recommendations: {
        soulMatch: dj('marshmello', 'MARSHMELLO'),
        mustSee: [dj('carta', 'CARTA'), dj('dennett', 'DENNETT')],
        recommended: [],
        challenge: [],
      },
      recommendedEvents: [],
    } satisfies PersonalityTestResult;

    const selection = buildPersonalityItinerarySelection(result, {
      activityLegacyId: 5,
      name: 'EDC Thailand 2026',
      dateLabel: '12/18-20',
      matchedDjs: ['CARTA', 'DENNETT', 'FIFI'],
      matchScore: 70,
      reason: '阵容含 CARTA、DENNETT、FIFI 等',
    });

    expect(selection.selectedDjIds).toEqual(['carta', 'dennett']);
    expect(selection.selectedDjNames).toEqual(['CARTA', 'DENNETT']);
    expect(selection.focusDjName).toBe('CARTA');
  });

  it('focuses soul dj when they are on the target event lineup', () => {
    const result = {
      ...baseResult,
      recommendations: {
        soulMatch: dj('marshmello', 'MARSHMELLO'),
        mustSee: [dj('carta', 'CARTA')],
        recommended: [],
        challenge: [],
      },
      recommendedEvents: [],
    } satisfies PersonalityTestResult;

    const selection = buildPersonalityItinerarySelection(result, {
      activityLegacyId: 8,
      name: 'EDC Korea 2026',
      dateLabel: '2026.05',
      matchedDjs: ['MARSHMELLO', 'CARTA'],
      matchScore: 100,
      reason: '阵容含 MARSHMELLO、CARTA',
    });

    expect(selection.selectedDjIds).toEqual(['marshmello', 'carta']);
    expect(selection.focusDjName).toBe('MARSHMELLO');
  });
});
