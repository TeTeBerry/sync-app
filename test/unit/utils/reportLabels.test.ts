import { describe, expect, it } from 'vitest';
import {
  buildReportedStatusMessage,
  buildReportSubmitSuccessMessage,
  reportCategoryLabel,
} from '@/utils/reportLabels';

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

  it('builds pending status copy with manual review hint', () => {
    const message = buildReportedStatusMessage({
      category: 'vulgar',
      reviewStatus: 'pending',
    });
    expect(message).toContain('人工复核');
    expect(message).not.toMatch(/24\s*小时|小时内/);
  });

  it('builds submit success copy for pending review', () => {
    const message = buildReportSubmitSuccessMessage({
      category: 'ads',
      reviewStatus: 'pending',
    });
    expect(message).toContain('举报已提交');
    expect(message).toContain('人工复核');
  });
});
