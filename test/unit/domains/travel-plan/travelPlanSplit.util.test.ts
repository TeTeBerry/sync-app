import { describe, expect, it } from 'vitest';
import type { TravelPlanNode } from '@/domains/travel-plan/types';
import {
  buildTravelPlanSplitSummaryText,
  clampSplitCount,
  computeTravelPlanPerPerson,
  formatNodeSplitLabel,
  resolveDefaultSplitCount,
} from '@/domains/travel-plan/utils/travelPlanSplit.util';

const BASE_NODE: TravelPlanNode = {
  id: 'dining-1',
  source: 'user',
  category: 'dining',
  startDate: '2025-06-14',
  endDate: '2025-06-14',
  timeLabel: '06/14',
  title: '晚餐',
  subtitle: '待补充',
  confirmed: true,
  price: 860,
  splitEnabled: true,
  splitCount: 4,
};

describe('travelPlanSplit.util', () => {
  it('clamps split count to 2–8', () => {
    expect(clampSplitCount(1)).toBe(2);
    expect(clampSplitCount(4)).toBe(4);
    expect(clampSplitCount(12)).toBe(8);
  });

  it('resolves default split count by priority', () => {
    expect(
      resolveDefaultSplitCount({
        queryHeadcount: 5,
        savedSplitCount: 3,
        guideHeadcount: 6,
      }),
    ).toBe(5);
    expect(
      resolveDefaultSplitCount({
        savedSplitCount: 3,
        guideHeadcount: 6,
      }),
    ).toBe(3);
    expect(resolveDefaultSplitCount({ guideHeadcount: 6 })).toBe(6);
    expect(resolveDefaultSplitCount({})).toBe(2);
  });

  it('computes per-person amount with rounding', () => {
    expect(computeTravelPlanPerPerson(860, 4)).toBe(215);
    expect(computeTravelPlanPerPerson(0, 4)).toBeNull();
  });

  it('formats node split label when enabled', () => {
    expect(formatNodeSplitLabel(860, true, 4)).toBe('¥860 · 4 人 · 人均 ¥215');
    expect(formatNodeSplitLabel(860, false, 4)).toBeNull();
  });

  it('builds split summary text with disclaimer', () => {
    const text = buildTravelPlanSplitSummaryText({
      eventName: 'EDC Orlando',
      nodes: [BASE_NODE],
      splitCount: 4,
      disclaimer: '试算仅供参考，请线下自行结算',
    });
    expect(text).toContain('EDC Orlando');
    expect(text).toContain('晚餐 · ¥860 · 人均 ¥215');
    expect(text).toContain('试算仅供参考，请线下自行结算');
  });

  it('excludes non-split nodes from summary', () => {
    const text = buildTravelPlanSplitSummaryText({
      eventName: 'EDC Orlando',
      nodes: [
        BASE_NODE,
        {
          ...BASE_NODE,
          id: 'personal',
          title: '个人消费',
          price: 120,
          splitEnabled: false,
        },
      ],
      splitCount: 4,
      disclaimer: '试算仅供参考，请线下自行结算',
    });
    expect(text).toContain('晚餐 · ¥860 · 人均 ¥215');
    expect(text).not.toContain('个人消费');
  });
});
