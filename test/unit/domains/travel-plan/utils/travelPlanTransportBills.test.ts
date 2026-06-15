import { describe, expect, it } from 'vitest';
import { shouldMergeTransportForms } from '@/domains/travel-plan/utils/travelPlanTransportBills';

describe('shouldMergeTransportForms', () => {
  it('merges ride-hailing bill list forms', () => {
    expect(
      shouldMergeTransportForms([
        {
          category: 'transport',
          timeRange: { startDate: '2026-06-14', endDate: '2026-06-14' },
          title: '滴滴出行',
          description: '6/14 19:37',
          cost: '29.9',
          remark: '',
        },
        {
          category: 'transport',
          timeRange: { startDate: '2026-06-15', endDate: '2026-06-15' },
          title: '高德打车',
          description: '6/15 13:53',
          cost: '33',
          remark: '',
        },
      ]),
    ).toBe(true);
  });

  it('keeps round-trip ticket legs separate', () => {
    expect(
      shouldMergeTransportForms([
        {
          category: 'transport',
          timeRange: { startDate: '2026-06-12', endDate: '2026-06-12' },
          title: '飞往深圳',
          description: 'CA1234',
          cost: '800',
          remark: '',
        },
        {
          category: 'transport',
          timeRange: { startDate: '2026-06-15', endDate: '2026-06-15' },
          title: '返程上海',
          description: 'CA5678',
          cost: '820',
          remark: '',
        },
      ]),
    ).toBe(false);
  });
});
