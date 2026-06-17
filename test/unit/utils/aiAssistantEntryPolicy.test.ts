import { describe, expect, it } from 'vitest';
import {
  BUDDY_POST_CTA,
  GENERATE_ITINERARY_CTA,
  GENERATE_TRAVEL_GUIDE_CTA,
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
        ['查阵容', GENERATE_TRAVEL_GUIDE_CTA, '其他问题'],
        8,
      ),
    ).toEqual(['查阵容', '其他问题']);
    expect(
      filterChecklistDuplicateSuggestedReplies(
        [GENERATE_ITINERARY_CTA, BUDDY_POST_CTA],
        8,
      ),
    ).toBeUndefined();
    expect(
      filterChecklistDuplicateSuggestedReplies([GENERATE_TRAVEL_GUIDE_CTA], undefined),
    ).toEqual([GENERATE_TRAVEL_GUIDE_CTA]);
  });
});
