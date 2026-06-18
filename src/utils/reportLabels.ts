import type { ReportCategory, ReportReviewStatus } from '../types/backend';

export const REPORT_CATEGORY_OPTIONS: ReadonlyArray<{
  id: ReportCategory;
  label: string;
}> = [
  { id: 'scalper', label: '黄牛倒票' },
  { id: 'ads', label: '广告引流' },
  { id: 'vulgar', label: '色情低俗' },
];

export function reportCategoryLabel(category?: ReportCategory): string {
  return (
    REPORT_CATEGORY_OPTIONS.find((item) => item.id === category)?.label ?? '违规内容'
  );
}

export function buildReportedStatusMessage(params: {
  category?: ReportCategory;
  reviewStatus?: ReportReviewStatus;
}): string {
  const categoryLabel = reportCategoryLabel(params.category);
  if (params.reviewStatus === 'acknowledged') {
    return `你已举报该内容为「${categoryLabel}」。我们已采取限制措施，感谢你的反馈。`;
  }
  return `你已举报该内容为「${categoryLabel}」。我们已收到，正在核实处理。`;
}

export const REPORT_SUBMIT_SUCCESS_MESSAGE =
  '感谢举报。我们会在核实后采取必要措施，处理结果不会单独通知。';
