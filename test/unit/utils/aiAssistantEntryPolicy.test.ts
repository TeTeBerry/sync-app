import { describe, expect, it } from 'vitest';
import {
  getBuddyPostCta,
  getGenerateItineraryCta,
  getGenerateTravelGuideCta,
} from '@/constants/aiCtaLabels';
import {
  filterChecklistDuplicateSuggestedReplies,
  shouldShowComposerActivityChips,
  shouldSuppressPlanSheetCtAs,
} from '@/utils/aiAssistantEntryPolicy';

describe('aiAssistantEntryPolicy', () => {
  it('hides composer activity shortcut chips', () => {
    expect(shouldShowComposerActivityChips()).toBe(false);
  });

  it('suppresses plan sheet CTAs when activity is bound', () => {
    expect(shouldSuppressPlanSheetCtAs(8, undefined)).toBe(true);
    expect(shouldSuppressPlanSheetCtAs(undefined, undefined)).toBe(false);
  });

  it('keeps plan sheet CTAs during buddy post collection flow', () => {
    expect(shouldSuppressPlanSheetCtAs(8, 'collect_post_body')).toBe(false);
    expect(shouldSuppressPlanSheetCtAs(8, 'publish_confirm')).toBe(false);
  });

  it('filters checklist-duplicate suggested replies when bound', () => {
    expect(
      filterChecklistDuplicateSuggestedReplies(
        ['查阵容', getGenerateTravelGuideCta(), '其他问题'],
        8,
      ),
    ).toEqual(['查阵容', '其他问题']);
    expect(
      filterChecklistDuplicateSuggestedReplies(
        [getGenerateItineraryCta(), getBuddyPostCta()],
        8,
      ),
    ).toBeUndefined();
    expect(
      filterChecklistDuplicateSuggestedReplies(
        [getGenerateTravelGuideCta()],
        undefined,
      ),
    ).toEqual([getGenerateTravelGuideCta()]);
  });
});
