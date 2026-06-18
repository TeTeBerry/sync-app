import { describe, expect, it } from 'vitest';
import { buildReportedStatusMessage, reportCategoryLabel } from '@/utils/reportLabels';

describe('reportLabels', () => {
  it('maps category ids to labels', () => {
    expect(reportCategoryLabel('scalper')).toBe('黄牛倒票');
    expect(reportCategoryLabel('ads')).toBe('广告引流');
  });

  it('builds acknowledged status copy', () => {
    expect(
      buildReportedStatusMessage({
        category: 'scalper',
        reviewStatus: 'acknowledged',
      }),
    ).toContain('已采取限制措施');
  });

  it('builds pending status copy', () => {
    expect(
      buildReportedStatusMessage({
        category: 'vulgar',
        reviewStatus: 'pending',
      }),
    ).toContain('正在核实处理');
  });
});
