import { describe, expect, it } from 'vitest';
import {
  formatReportSubmittedCopy,
  REPORT_SUBMITTED_MODAL,
} from '@/utils/reportFeedback';

describe('reportFeedback', () => {
  it('formatReportSubmittedCopy matches modal content', () => {
    expect(formatReportSubmittedCopy()).toBe(REPORT_SUBMITTED_MODAL.content);
    expect(formatReportSubmittedCopy()).toContain('核实');
  });
});
