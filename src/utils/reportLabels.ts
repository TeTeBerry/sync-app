import type { ReportCategory, ReportReviewStatus } from '../types/backend';

export function reportCategoryLabel(category?: ReportCategory): string {
  const labels: Record<ReportCategory, string> = {
    scalper: '黄牛倒票',
    ads: '广告引流',
    vulgar: '色情低俗',
  };
  return category ? (labels[category] ?? '违规内容') : '违规内容';
}

export function buildReportedStatusMessage(params: {
  category?: ReportCategory;
  reviewStatus?: ReportReviewStatus;
}): string {
  const categoryLabel = reportCategoryLabel(params.category);
  if (params.reviewStatus === 'acknowledged') {
    return `你已举报该内容为「${categoryLabel}」。我们已采取限制措施，感谢你的反馈。`;
  }
  return `你已举报该内容为「${categoryLabel}」。我们已受理，处理中并将进行人工复核。处理结果不会单独通知，感谢你的反馈。`;
}

export function buildReportSubmitSuccessMessage(params: {
  category?: ReportCategory;
  reviewStatus?: ReportReviewStatus;
}): string {
  const categoryLabel = reportCategoryLabel(params.category);
  if (params.reviewStatus === 'acknowledged') {
    return `举报已提交（${categoryLabel}）。我们已采取限制措施，感谢你的反馈。`;
  }
  return `举报已提交（${categoryLabel}）。我们已受理，处理中并将进行人工复核。处理结果不会单独通知，感谢你的反馈。`;
}
