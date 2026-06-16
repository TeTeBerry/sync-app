import { describe, expect, it } from 'vitest';
import {
  formatTravelGuideBudgetShareLabel,
  travelGuideBudgetBannerTitle,
  travelGuideBudgetPerPersonRange,
} from '@/domains/travel-guide/utils/travelGuideBudgetDisplay.util';

describe('travelGuideBudgetDisplay', () => {
  it('labels banner as total for multi-person trips', () => {
    expect(travelGuideBudgetBannerTitle(2)).toBe('全程预算参考（合计）');
    expect(travelGuideBudgetBannerTitle(1)).toBe('全程预算参考（单人合计）');
  });

  it('derives per-person range from total', () => {
    expect(travelGuideBudgetPerPersonRange('约 ¥8000–12000', 2)).toBe(
      '约 ¥4000–6000/人',
    );
    expect(travelGuideBudgetPerPersonRange('约 ¥5000–5000', 1)).toBeNull();
  });

  it('formats share label with total and per-person', () => {
    expect(formatTravelGuideBudgetShareLabel('约 ¥8000–12000', 2)).toBe(
      '约 ¥8000–12000（合计，约 ¥4000–6000/人）',
    );
    expect(formatTravelGuideBudgetShareLabel('约 ¥5000–7000', 1)).toBe(
      '约 ¥5000–7000（合计）',
    );
  });
});
