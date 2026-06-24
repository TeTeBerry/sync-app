import type { BuddyPostComposeHints } from '@/types/partner';
import { loadPersonalityTestResult } from '@/domains/personality-test/utils/personalityTestStorage';
import {
  getCachedPersonalityTestCatalog,
  getPersonalityMeta,
} from '@/domains/personality-test';

export function buildBuddyPostComposeHints(options: {
  prefillBannerTitle?: string | null;
  prefillSummaryLines?: string[] | null;
  note?: string;
}): BuddyPostComposeHints | undefined {
  const banner = options.prefillBannerTitle?.trim() ?? '';
  const summary = (options.prefillSummaryLines ?? [])
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' · ');
  const hints: BuddyPostComposeHints = {};

  if (summary) {
    hints.prefillSummary = summary;
  }

  if (banner.includes('人格')) {
    const result = loadPersonalityTestResult();
    if (result) {
      hints.personalityType = result.score.primaryType;
      const catalog = getCachedPersonalityTestCatalog();
      if (catalog) {
        const meta = getPersonalityMeta(catalog, result.score.primaryType);
        if (meta.genreTags.length) {
          hints.favorGenres = meta.genreTags.slice(0, 3);
        }
      }
    }
  }

  if (banner.includes('Set')) {
    const note = options.note?.trim() ?? '';
    const fromNote = note.startsWith('必看 Set：')
      ? note
          .replace(/^必看 Set：/, '')
          .split('·')
          .map((part) => part.trim())
          .filter(Boolean)
      : [];
    if (fromNote.length) {
      hints.setPicks = fromNote;
    }
  }

  return Object.keys(hints).length > 0 ? hints : undefined;
}
