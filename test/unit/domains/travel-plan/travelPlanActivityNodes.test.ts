import { describe, expect, it } from 'vitest';
import { buildDefaultActivityTravelPlanNodes } from '@/domains/travel-plan/utils/travelPlanActivityNodes';

describe('buildDefaultActivityTravelPlanNodes', () => {
  it('expands 06/13-14 into two activity cards when sessions are empty', () => {
    const nodes = buildDefaultActivityTravelPlanNodes({
      activityLegacyId: 99,
      eventName: '风暴电音节 深圳站',
      activityDate: '06/13-14',
      location: '深圳国际会展中心',
      sessions: [],
    });

    expect(nodes).toHaveLength(2);
    expect(nodes[0]?.id).toBe('activity-event-jun13');
    expect(nodes[0]?.title).toContain('Day 1');
    expect(nodes[1]?.id).toBe('activity-event-jun14');
    expect(nodes[1]?.title).toContain('Day 2');
  });

  it('returns no nodes when sessions and activityDate are missing', () => {
    const nodes = buildDefaultActivityTravelPlanNodes({
      activityLegacyId: 4,
      eventName: '风暴电音节 深圳站',
      location: '深圳国际会展中心',
    });

    expect(nodes).toEqual([]);
  });
});
