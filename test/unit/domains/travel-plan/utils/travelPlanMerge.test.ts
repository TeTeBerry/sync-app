import { describe, expect, it } from 'vitest';
import { mergeTravelPlanNodes } from '@sync/travel-plan-contracts';
import type { TravelPlanNode } from '@/domains/travel-plan/types';

const baseNode = (
  partial: Partial<TravelPlanNode> &
    Pick<TravelPlanNode, 'id' | 'category' | 'startDate'>,
): TravelPlanNode => ({
  source: 'user',
  endDate: partial.startDate,
  timeLabel: '06/13',
  title: partial.title ?? partial.id,
  subtitle: '副标题',
  confirmed: true,
  ...partial,
});

describe('mergeTravelPlanNodes', () => {
  it('sorts activity and user nodes on one timeline', () => {
    const merged = mergeTravelPlanNodes(
      [
        baseNode({
          id: 'activity-event-jun14',
          source: 'activity',
          category: 'event',
          startDate: '2025-06-14',
          title: 'Day 2',
        }),
        baseNode({
          id: 'activity-event-jun13',
          source: 'activity',
          category: 'event',
          startDate: '2025-06-13',
          title: 'Day 1',
        }),
      ],
      [
        baseNode({
          id: 'hotel',
          category: 'hotel',
          startDate: '2025-06-13',
          endDate: '2025-06-15',
        }),
        baseNode({
          id: 'flight-in',
          category: 'flight',
          startDate: '2025-06-13',
        }),
      ],
    );

    expect(merged.map((node) => node.id)).toEqual([
      'flight-in',
      'hotel',
      'activity-event-jun13',
      'activity-event-jun14',
    ]);
  });

  it('sorts return transport after same-year activity events', () => {
    const merged = mergeTravelPlanNodes(
      [
        baseNode({
          id: 'activity-event-jun13',
          source: 'activity',
          category: 'event',
          startDate: '2026-06-13',
          title: 'Day 1',
        }),
        baseNode({
          id: 'activity-event-jun14',
          source: 'activity',
          category: 'event',
          startDate: '2026-06-14',
          title: 'Day 2',
        }),
      ],
      [
        baseNode({
          id: 'flight-out',
          category: 'transport',
          startDate: '2026-06-13',
          startTime: '12:55',
        }),
        baseNode({
          id: 'flight-back',
          category: 'transport',
          startDate: '2026-06-15',
          startTime: '14:50',
        }),
      ],
    );

    expect(merged.map((node) => node.id)).toEqual([
      'flight-out',
      'activity-event-jun13',
      'activity-event-jun14',
      'flight-back',
    ]);
  });
});
