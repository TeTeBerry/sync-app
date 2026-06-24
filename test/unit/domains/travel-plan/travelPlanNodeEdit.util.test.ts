import { describe, expect, it } from 'vitest';
import type { TravelPlanNode } from '@/domains/travel-plan/types';
import {
  rebuildTravelPlanNodesForEdit,
  replaceTravelPlanNodeInList,
  travelPlanNodeToAddFormValues,
} from '@/domains/travel-plan/utils/travelPlanNodeEdit.util';

const DINING_NODE: TravelPlanNode = {
  id: 'dining-1',
  source: 'user',
  category: 'dining',
  startDate: '2025-06-14',
  endDate: '2025-06-14',
  timeLabel: '06/14',
  title: '佳能量 等 2 笔',
  subtitle: '共 2 笔消费',
  confirmed: true,
  price: 42.7,
  splitEnabled: true,
  splitCount: 4,
  diningBills: [
    {
      id: 'bill-1',
      title: '佳能量',
      cost: 24,
      startDate: '2025-06-14',
      startTime: '12:10',
    },
    {
      id: 'bill-2',
      title: '便利店',
      cost: 18.7,
      startDate: '2025-06-14',
    },
  ],
};

describe('travelPlanNodeEdit.util', () => {
  it('expands dining bills into editable form segments', () => {
    const forms = travelPlanNodeToAddFormValues(DINING_NODE);
    expect(forms).toHaveLength(2);
    expect(forms[0]?.title).toBe('佳能量');
    expect(forms[0]?.cost).toBe('24');
    expect(forms[1]?.title).toBe('便利店');
  });

  it('rebuilds edited node while preserving id', () => {
    const forms = travelPlanNodeToAddFormValues(DINING_NODE);
    const rebuilt = rebuildTravelPlanNodesForEdit('dining-1', forms);
    expect(rebuilt).toHaveLength(1);
    expect(rebuilt[0]?.id).toBe('dining-1');
    expect(rebuilt[0]?.price).toBe(42.7);
  });

  it('replaces node in list', () => {
    const next = replaceTravelPlanNodeInList(
      [DINING_NODE, { ...DINING_NODE, id: 'other', title: '其他' }],
      'dining-1',
      [{ ...DINING_NODE, title: '更新后', price: 50 }],
    );
    expect(next).toHaveLength(2);
    expect(next.find((node) => node.id === 'dining-1')?.title).toBe('更新后');
  });
});
