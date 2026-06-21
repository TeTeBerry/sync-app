import { describe, expect, it } from 'vitest';
import { buildFestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';

describe('buildFestivalPlanChecklist', () => {
  it('marks next incomplete task and counts progress', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      travelGuideId: 'g1',
      hasItinerary: false,
      hasBuddyPost: false,
    });

    expect(checklist.completedCount).toBe(1);
    expect(checklist.totalCount).toBe(3);
    expect(checklist.nextTaskKey).toBe('itinerary');

    const itinerary = checklist.tasks.find((task) => task.key === 'itinerary');
    expect(itinerary?.done).toBe(false);
    expect(itinerary?.isNext).toBe(true);
    expect(itinerary?.trailingLabel).toBe('排专属行程');

    const travelGuide = checklist.tasks.find((task) => task.key === 'travel_guide');
    expect(travelGuide?.done).toBe(true);
    expect(travelGuide?.trailingLabel).toBe('查看出行攻略');
  });

  it('shows itinerary day count when done', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: false,
      hasItinerary: true,
      itineraryDayCount: 3,
      hasBuddyPost: false,
    });

    const itinerary = checklist.tasks.find((task) => task.key === 'itinerary');
    expect(itinerary?.label).toBe('3 天行程');
  });
});
