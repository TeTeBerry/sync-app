import { describe, expect, it } from 'vitest';
import { buildFestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { resolveFestivalPlanVisibleTasks } from '@/domains/festival-plan/resolveFestivalPlanVisibleTasks';

describe('resolveFestivalPlanVisibleTasks', () => {
  it('shows only next task when collapsed', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      travelGuideId: 'g1',
      hasItinerary: false,
      hasBuddyPost: false,
      isRegistered: false,
    });

    const visible = resolveFestivalPlanVisibleTasks(checklist.tasks, {
      expanded: false,
      nextTaskKey: checklist.nextTaskKey,
    });

    expect(visible).toHaveLength(1);
    expect(visible[0]?.key).toBe('itinerary');
  });

  it('shows all tasks when expanded', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      travelGuideId: 'g1',
      hasItinerary: false,
      hasBuddyPost: false,
      isRegistered: false,
    });

    const visible = resolveFestivalPlanVisibleTasks(checklist.tasks, {
      expanded: true,
      nextTaskKey: checklist.nextTaskKey,
    });

    expect(visible).toHaveLength(4);
  });

  it('shows no tasks when collapsed and all complete', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasItinerary: true,
      itineraryDayCount: 2,
      hasBuddyPost: true,
      isRegistered: true,
    });

    const visible = resolveFestivalPlanVisibleTasks(checklist.tasks, {
      expanded: false,
      nextTaskKey: checklist.nextTaskKey,
    });

    expect(visible).toHaveLength(0);
    expect(checklist.nextTaskKey).toBeUndefined();
  });
});
