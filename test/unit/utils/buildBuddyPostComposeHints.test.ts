import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildBuddyPostComposeHints } from '@/utils/buildBuddyPostComposeHints';

const loadPersonalityTestResult = vi.fn(() => ({
  score: { primaryType: 'frontline' },
  recommendations: { soulMatch: { djName: 'Test DJ' } },
  version: 1,
}));

const getCachedPersonalityTestCatalog = vi.fn(() => ({
  version: 1,
  types: {
    frontline: {
      id: 'frontline',
      label: 'Frontline',
      genreTags: ['Techno', 'Hard Techno'],
    },
  },
}));

const getPersonalityMeta = vi.fn((_catalog: unknown, type: string) => ({
  id: type,
  label: 'Frontline',
  genreTags: ['Techno', 'Hard Techno'],
}));

vi.mock('@/domains/personality-test/utils/personalityTestStorage', () => ({
  loadPersonalityTestResult: () => loadPersonalityTestResult(),
}));

vi.mock('@/domains/personality-test', () => ({
  getCachedPersonalityTestCatalog: () => getCachedPersonalityTestCatalog(),
  getPersonalityMeta: (catalog: unknown, type: string) =>
    getPersonalityMeta(catalog, type),
}));

describe('buildBuddyPostComposeHints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns personality hints from personality prefill banner', () => {
    const hints = buildBuddyPostComposeHints({
      prefillBannerTitle: '人格测试 · 组队预填',
      prefillSummaryLines: ['EDC Korea', '偏 Techno'],
    });

    expect(hints?.personalityType).toBe('frontline');
    expect(hints?.favorGenres).toEqual(['Techno', 'Hard Techno']);
    expect(hints?.prefillSummary).toContain('EDC Korea');
  });

  it('parses set picks from note when banner is set vote prefill', () => {
    const hints = buildBuddyPostComposeHints({
      prefillBannerTitle: '必看 Set · 组队预填',
      prefillSummaryLines: ['EDC Korea'],
      note: '必看 Set：Martin Garrix · Hardwell',
    });

    expect(hints?.setPicks).toEqual(['Martin Garrix', 'Hardwell']);
  });

  it('returns undefined when no hints are available', () => {
    expect(buildBuddyPostComposeHints({})).toBeUndefined();
  });
});
