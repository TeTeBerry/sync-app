import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handleFestivalPlanTaskPress } from '@/domains/festival-plan/festivalPlanNavigation.util';
import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';

const goExclusiveItinerary = vi.fn();
const goAiTravelGuide = vi.fn();
const goEventDetail = vi.fn();

vi.mock('@/utils/route', () => ({
  goExclusiveItinerary: (...args: unknown[]) => goExclusiveItinerary(...args),
  goAiTravelGuide: (...args: unknown[]) => goAiTravelGuide(...args),
  goEventDetail: (...args: unknown[]) => goEventDetail(...args),
}));

const baseChecklist: FestivalPlanChecklist = {
  tasks: [],
  completedCount: 2,
  totalCount: 3,
  nextTaskKey: 'buddy_post',
  travelGuideId: 'guide-1',
  itineraryDayCount: 2,
  buddyPostId: 'post-1',
};

describe('handleFestivalPlanTaskPress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes completed itinerary to exclusive itinerary', () => {
    handleFestivalPlanTaskPress(
      {
        key: 'itinerary',
        done: true,
        label: '行程',
        description: '',
      },
      { activityLegacyId: 9, checklist: baseChecklist },
    );

    expect(goExclusiveItinerary).toHaveBeenCalledWith(9);
  });

  it('routes completed buddy post to post detail without reopening sheet', () => {
    handleFestivalPlanTaskPress(
      {
        key: 'buddy_post',
        done: true,
        label: '组队',
        description: '',
      },
      { activityLegacyId: 9, checklist: baseChecklist },
    );

    expect(goEventDetail).toHaveBeenCalledWith(9, {
      postId: 'post-1',
      focusPosts: true,
    });
  });

  it('routes completed travel guide to guide detail', () => {
    handleFestivalPlanTaskPress(
      {
        key: 'travel_guide',
        done: true,
        label: '攻略',
        description: '',
      },
      { activityLegacyId: 9, checklist: baseChecklist },
    );

    expect(goAiTravelGuide).toHaveBeenCalledWith('guide-1');
  });
});
