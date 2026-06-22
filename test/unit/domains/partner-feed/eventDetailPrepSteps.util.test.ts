import { describe, expect, it, vi } from 'vitest';
import { buildFestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { buildEventDetailPrepSteps } from '@/domains/partner-feed/utils/eventDetailPrepSteps.util';

const t = (key: string) => key;

describe('buildEventDetailPrepSteps', () => {
  it('omits itinerary step for guests so lineup entry stays on info card only', () => {
    const onAiGuideClick = vi.fn();
    const onOpenExclusiveItinerary = vi.fn();

    const steps = buildEventDetailPrepSteps({
      showFestivalPlan: false,
      travelGuideGenerated: false,
      onAiGuideClick,
      onOpenExclusiveItinerary,
      t,
    });

    expect(steps.map((step) => step.key)).toEqual(['travel_guide']);
  });

  it('includes itinerary checklist step with festival plan labels when logged in', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasItinerary: false,
      hasBuddyPost: false,
    });
    const onFestivalPlanTaskPress = vi.fn();

    const steps = buildEventDetailPrepSteps({
      showFestivalPlan: true,
      checklist,
      onAiGuideClick: vi.fn(),
      onOpenExclusiveItinerary: vi.fn(),
      onFestivalPlanTaskPress,
      t,
    });

    expect(steps.map((step) => step.key)).toEqual([
      'travel_guide',
      'buddy_post',
      'exclusive_itinerary',
    ]);

    const itinerary = steps.find((step) => step.key === 'exclusive_itinerary');
    expect(itinerary?.actionLabel).toBe('排演出表');
    expect(itinerary?.isNext).toBe(false);

    const buddyPost = steps.find((step) => step.key === 'buddy_post');
    expect(buddyPost?.isNext).toBe(true);
  });

  it('shows view schedule label when itinerary task is complete', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasItinerary: true,
      itineraryDayCount: 2,
      hasBuddyPost: false,
    });

    const steps = buildEventDetailPrepSteps({
      showFestivalPlan: true,
      checklist,
      onAiGuideClick: vi.fn(),
      onOpenExclusiveItinerary: vi.fn(),
      t,
    });

    const itinerary = steps.find((step) => step.key === 'exclusive_itinerary');
    expect(itinerary?.actionLabel).toBe('查看演出表');
    expect(itinerary?.label).toBe('2 天行程');
  });
});
